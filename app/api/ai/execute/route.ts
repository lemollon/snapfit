import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { habits, habitLogs, personalRecords, personalRecordHistory, workouts, foodLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface ParsedAction {
  type: 'workout' | 'food' | 'habit' | 'pr' | 'timer' | 'recipe' | 'navigate' | 'info' | 'unknown';
  data: Record<string, any>;
  message: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { action } = body as { action: ParsedAction };

    if (!action || !action.type) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    switch (action.type) {
      case 'habit': {
        const { habitType, amount, value, duration, name, completed } = action.data;

        // Handle water specifically
        if (habitType === 'water') {
          // Find or create water habit
          let waterHabit = await db
            .select()
            .from(habits)
            .where(and(
              eq(habits.userId, userId),
              eq(habits.name, 'Water Intake')
            ));

          let habitId: string;

          if (waterHabit.length === 0) {
            const [newHabit] = await db
              .insert(habits)
              .values({
                userId,
                name: 'Water Intake',
                icon: 'droplet',
                color: 'blue',
                type: 'quantity',
                targetValue: 8,
                unit: 'glasses',
                frequency: 'daily',
              })
              .returning();
            habitId = newHabit.id;
          } else {
            habitId = waterHabit[0].id;
          }

          // Log the water
          const existingLog = await db
            .select()
            .from(habitLogs)
            .where(and(
              eq(habitLogs.habitId, habitId),
              eq(habitLogs.date, today)
            ));

          if (existingLog.length > 0) {
            const newValue = (existingLog[0].value || 0) + (amount || 1);
            await db
              .update(habitLogs)
              .set({
                value: newValue,
                completed: newValue >= 8,
                completedAt: newValue >= 8 ? new Date() : null,
              })
              .where(eq(habitLogs.id, existingLog[0].id));

            return NextResponse.json({
              success: true,
              message: `💧 Logged ${amount || 1} glass${(amount || 1) > 1 ? 'es' : ''} of water! Total today: ${newValue}/8`,
              data: { total: newValue, target: 8 },
            });
          } else {
            await db.insert(habitLogs).values({
              userId,
              habitId,
              date: today,
              value: amount || 1,
              completed: (amount || 1) >= 8,
              completedAt: (amount || 1) >= 8 ? new Date() : null,
            });

            return NextResponse.json({
              success: true,
              message: `💧 Logged ${amount || 1} glass${(amount || 1) > 1 ? 'es' : ''} of water!`,
              data: { total: amount || 1, target: 8 },
            });
          }
        }

        // Handle other habits like meditation, sleep, steps
        if (habitType === 'meditation' || habitType === 'sleep' || habitType === 'steps') {
          const habitName = habitType === 'meditation' ? 'Meditation' :
                           habitType === 'sleep' ? 'Sleep' : 'Steps';

          let habit = await db
            .select()
            .from(habits)
            .where(and(
              eq(habits.userId, userId),
              eq(habits.name, habitName)
            ));

          let habitId: string;

          if (habit.length === 0) {
            const [newHabit] = await db
              .insert(habits)
              .values({
                userId,
                name: habitName,
                icon: habitType === 'meditation' ? 'brain' : habitType === 'sleep' ? 'moon' : 'footprints',
                color: habitType === 'meditation' ? 'purple' : habitType === 'sleep' ? 'indigo' : 'green',
                type: 'quantity',
                targetValue: habitType === 'meditation' ? 20 : habitType === 'sleep' ? 8 : 10000,
                unit: habitType === 'steps' ? 'steps' : habitType === 'sleep' ? 'hours' : 'minutes',
                frequency: 'daily',
              })
              .returning();
            habitId = newHabit.id;
          } else {
            habitId = habit[0].id;
          }

          const logValue = value || duration || 0;

          await db.insert(habitLogs).values({
            userId,
            habitId,
            date: today,
            value: logValue,
            completed: true,
            completedAt: new Date(),
          });

          const emoji = habitType === 'meditation' ? '🧘' : habitType === 'sleep' ? '😴' : '🚶';
          return NextResponse.json({
            success: true,
            message: `${emoji} Logged ${logValue} ${habitType === 'steps' ? 'steps' : habitType === 'sleep' ? 'hours of sleep' : 'minutes of meditation'}!`,
          });
        }

        return NextResponse.json({
          success: true,
          message: `✓ Habit logged!`,
        });
      }

      case 'pr': {
        const { exerciseName, maxWeight, maxReps, unit, category } = action.data;

        // Check for existing record
        const existingRecords = await db
          .select()
          .from(personalRecords)
          .where(and(
            eq(personalRecords.userId, userId),
            eq(personalRecords.exerciseName, exerciseName)
          ));

        const existingRecord = existingRecords[0];

        if (existingRecord) {
          const isNewPR = maxWeight > (existingRecord.maxWeight || 0);

          if (isNewPR) {
            const improvement = existingRecord.maxWeight
              ? ((maxWeight - existingRecord.maxWeight) / existingRecord.maxWeight) * 100
              : 100;

            await db
              .update(personalRecords)
              .set({
                maxWeight,
                maxReps,
                achievedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(personalRecords.id, existingRecord.id));

            await db.insert(personalRecordHistory).values({
              userId,
              personalRecordId: existingRecord.id,
              exerciseName,
              recordType: 'max_weight',
              previousValue: existingRecord.maxWeight || 0,
              newValue: maxWeight,
              improvement,
              celebrationShown: false,
            });

            return NextResponse.json({
              success: true,
              isNewPR: true,
              message: `🎉 NEW PR! ${exerciseName} at ${maxWeight}${unit}! That's a ${improvement.toFixed(1)}% improvement!`,
              improvement,
            });
          } else {
            return NextResponse.json({
              success: true,
              isNewPR: false,
              message: `💪 Logged ${exerciseName} at ${maxWeight}${unit} for ${maxReps} reps. Your PR is ${existingRecord.maxWeight}${unit}!`,
            });
          }
        } else {
          const [newRecord] = await db
            .insert(personalRecords)
            .values({
              userId,
              exerciseName,
              category: category || 'strength',
              maxWeight,
              maxReps,
              unit: unit || 'lbs',
            })
            .returning();

          await db.insert(personalRecordHistory).values({
            userId,
            personalRecordId: newRecord.id,
            exerciseName,
            recordType: 'max_weight',
            previousValue: 0,
            newValue: maxWeight,
            improvement: 100,
            celebrationShown: false,
          });

          return NextResponse.json({
            success: true,
            isNewPR: true,
            message: `🏆 First ${exerciseName} PR recorded: ${maxWeight}${unit} for ${maxReps} reps!`,
          });
        }
      }

      case 'workout': {
        const { type, duration, unit } = action.data;
        const durationMinutes = unit === 'hours' ? duration * 60 : duration;

        const [workout] = await db
          .insert(workouts)
          .values({
            userId,
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Session`,
            duration: durationMinutes,
            fitnessLevel: 'intermediate',
            notes: `Logged via AI: ${type}`,
          })
          .returning();

        return NextResponse.json({
          success: true,
          message: `🏋️ Logged ${duration} ${unit === 'hours' ? 'hour' : 'minute'} ${type}! Great work!`,
          workoutId: workout.id,
        });
      }

      case 'food': {
        const { description, meal, calories, protein } = action.data;

        const [log] = await db
          .insert(foodLogs)
          .values({
            userId,
            foodName: description,
            mealType: meal || 'snack',
            calories: calories || 0,
            protein: protein || 0,
          })
          .returning();

        let message = `🍽️ Logged "${description}"`;
        if (calories) message += ` (${calories} cal)`;
        message += '!';

        return NextResponse.json({
          success: true,
          message,
          logId: log.id,
        });
      }

      case 'timer': {
        const { duration, unit, timerType } = action.data;
        // Timer is handled client-side, we just acknowledge
        return NextResponse.json({
          success: true,
          message: `⏱️ Starting ${duration} ${unit} ${timerType}! Good luck!`,
          timer: { duration, unit, type: timerType },
        });
      }

      case 'recipe': {
        const { query } = action.data;
        return NextResponse.json({
          success: true,
          message: `🍳 Searching for ${query} recipes...`,
          redirect: `/recipes?search=${encodeURIComponent(query)}`,
        });
      }

      case 'navigate': {
        const { destination, route } = action.data;
        return NextResponse.json({
          success: true,
          message: `🚀 Opening ${destination}...`,
          redirect: route,
        });
      }

      case 'info': {
        const { infoType, category, quote } = action.data;

        if (infoType === 'motivation') {
          return NextResponse.json({
            success: true,
            message: quote,
            noAction: true,
          });
        }

        if (infoType === 'progress') {
          // Get user stats
          const today = new Date().toISOString().split('T')[0];
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          // Get workout count
          const workoutsThisWeek = await db
            .select()
            .from(workouts)
            .where(eq(workouts.userId, userId));

          // Get habit completion
          const habitsCompleted = await db
            .select()
            .from(habitLogs)
            .where(and(
              eq(habitLogs.userId, userId),
              eq(habitLogs.date, today),
              eq(habitLogs.completed, true)
            ));

          // Get recent PRs
          const recentPRs = await db
            .select()
            .from(personalRecordHistory)
            .where(eq(personalRecordHistory.userId, userId))
            .limit(3);

          return NextResponse.json({
            success: true,
            message: `📊 This Week's Progress:\n\n• ${workoutsThisWeek.length} workouts logged\n• ${habitsCompleted.length} habits completed today\n• ${recentPRs.length} recent PRs\n\nKeep it up! 💪`,
            noAction: true,
          });
        }

        if (infoType === 'suggestion') {
          const suggestions = {
            nutrition: [
              '🥗 Try adding more protein to your meals - aim for 30g per meal',
              '💧 Remember to drink water before meals to help with portion control',
              '🥚 Consider meal prepping on Sundays to stay on track',
              '🍎 Snack on fruits and nuts instead of processed foods',
            ],
            workout: [
              '🏋️ Focus on compound movements like squats and deadlifts',
              '💪 Try progressive overload - add 5lbs each week',
              '🔥 Add a HIIT session for extra calorie burn',
              '🧘 Don\'t skip your warm-up and cool-down stretches',
            ],
            general: [
              '😴 Prioritize 7-8 hours of sleep for recovery',
              '📱 Log your meals right after eating for accuracy',
              '🎯 Set a specific goal for this week',
              '👥 Find a workout buddy for accountability',
            ],
          };

          const categoryKey = (category || 'general') as keyof typeof suggestions;
          const tipList = suggestions[categoryKey] || suggestions.general;
          const tip = tipList[Math.floor(Math.random() * tipList.length)];

          return NextResponse.json({
            success: true,
            message: tip,
            noAction: true,
          });
        }

        return NextResponse.json({
          success: true,
          message: 'ℹ️ Here to help!',
          noAction: true,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          message: "I couldn't process that action. Please try again.",
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error executing AI action:', error);
    return NextResponse.json({ error: 'Failed to execute action' }, { status: 500 });
  }
}
