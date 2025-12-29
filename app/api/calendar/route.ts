import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  users, scheduledWorkouts, mealPlans, workouts, foodLogs,
  progressPhotos, dailyLogs, scheduledCheckIns, programPurchases,
  programWeeks, trainingPrograms
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// GET - Fetch comprehensive calendar data for a date range
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const view = searchParams.get('view') || 'month'; // day, week, month
    const specificDate = searchParams.get('date'); // For day view

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch all data in parallel
    const [
      scheduled,
      completed,
      meals,
      foodLogsData,
      photos,
      dailyLogsData,
      checkIns,
      purchases
    ] = await Promise.all([
      // Scheduled workouts
      db.select()
        .from(scheduledWorkouts)
        .where(and(
          eq(scheduledWorkouts.userId, userId),
          gte(scheduledWorkouts.scheduledFor, start),
          lte(scheduledWorkouts.scheduledFor, end)
        ))
        .orderBy(scheduledWorkouts.scheduledFor),

      // Completed workouts
      db.select()
        .from(workouts)
        .where(and(
          eq(workouts.userId, userId),
          gte(workouts.createdAt, start),
          lte(workouts.createdAt, end)
        ))
        .orderBy(workouts.createdAt),

      // Meal plans
      db.select()
        .from(mealPlans)
        .where(and(
          eq(mealPlans.userId, userId),
          gte(mealPlans.scheduledFor, formatDate(start)),
          lte(mealPlans.scheduledFor, formatDate(end))
        )),

      // Food logs
      db.select()
        .from(foodLogs)
        .where(and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.loggedAt, start),
          lte(foodLogs.loggedAt, end)
        ))
        .orderBy(foodLogs.loggedAt),

      // Progress photos
      db.select()
        .from(progressPhotos)
        .where(and(
          eq(progressPhotos.userId, userId),
          gte(progressPhotos.takenAt, start),
          lte(progressPhotos.takenAt, end)
        ))
        .orderBy(progressPhotos.takenAt),

      // Daily logs
      db.select()
        .from(dailyLogs)
        .where(and(
          eq(dailyLogs.userId, userId),
          gte(dailyLogs.date, formatDate(start)),
          lte(dailyLogs.date, formatDate(end))
        )),

      // Scheduled check-ins
      db.select()
        .from(scheduledCheckIns)
        .where(and(
          eq(scheduledCheckIns.clientId, userId),
          gte(scheduledCheckIns.scheduledFor, start),
          lte(scheduledCheckIns.scheduledFor, end)
        ))
        .orderBy(scheduledCheckIns.scheduledFor),

      // Program purchases (to get scheduled program workouts)
      db.select({
        purchase: programPurchases,
        program: trainingPrograms,
      })
        .from(programPurchases)
        .leftJoin(trainingPrograms, eq(programPurchases.programId, trainingPrograms.id))
        .where(and(
          eq(programPurchases.userId, userId),
          eq(programPurchases.status, 'active')
        ))
    ]);

    // Calculate macro summaries
    const macrosByDate: Record<string, {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      mealsLogged: number;
    }> = {};

    foodLogsData.forEach(log => {
      if (log.loggedAt) {
        const dateKey = formatDate(new Date(log.loggedAt));
        if (!macrosByDate[dateKey]) {
          macrosByDate[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, mealsLogged: 0 };
        }
        macrosByDate[dateKey].calories += log.calories || 0;
        macrosByDate[dateKey].protein += log.protein || 0;
        macrosByDate[dateKey].carbs += log.carbs || 0;
        macrosByDate[dateKey].fat += log.fat || 0;
        macrosByDate[dateKey].fiber += log.fiber || 0;
        macrosByDate[dateKey].mealsLogged += 1;
      }
    });

    // Calculate period summaries
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysWithData = Object.keys(macrosByDate).length;

    const periodTotals = Object.values(macrosByDate).reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat,
        fiber: acc.fiber + day.fiber,
        mealsLogged: acc.mealsLogged + day.mealsLogged,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, mealsLogged: 0 }
    );

    const periodAverages = {
      calories: daysWithData > 0 ? Math.round(periodTotals.calories / daysWithData) : 0,
      protein: daysWithData > 0 ? Math.round(periodTotals.protein / daysWithData) : 0,
      carbs: daysWithData > 0 ? Math.round(periodTotals.carbs / daysWithData) : 0,
      fat: daysWithData > 0 ? Math.round(periodTotals.fat / daysWithData) : 0,
      fiber: daysWithData > 0 ? Math.round(periodTotals.fiber / daysWithData) : 0,
    };

    // Group photos by date
    const photosByDate: Record<string, typeof photos> = {};
    photos.forEach(photo => {
      if (photo.takenAt) {
        const dateKey = formatDate(new Date(photo.takenAt));
        if (!photosByDate[dateKey]) {
          photosByDate[dateKey] = [];
        }
        photosByDate[dateKey].push(photo);
      }
    });

    // Format events for calendar display
    const events = [
      ...scheduled.map(s => ({
        id: s.id,
        type: 'scheduled_workout' as const,
        title: s.title,
        description: s.description,
        date: s.scheduledFor,
        status: s.status,
        duration: s.duration,
        trainerId: s.trainerId,
        color: s.status === 'completed' ? '#22c55e' : s.status === 'skipped' ? '#ef4444' : '#6366f1',
      })),
      ...completed.map(w => ({
        id: w.id,
        type: 'completed_workout' as const,
        title: w.title || 'Workout',
        date: w.createdAt,
        duration: w.duration,
        color: '#22c55e',
      })),
      ...meals.map(m => ({
        id: m.id,
        type: 'meal_plan' as const,
        title: m.name,
        date: new Date(m.scheduledFor),
        mealType: m.mealType,
        status: m.status,
        targetCalories: m.targetCalories,
        targetProtein: m.targetProtein,
        color: m.status === 'logged' ? '#22c55e' : '#f59e0b',
      })),
      ...checkIns.map(c => ({
        id: c.id,
        type: 'check_in' as const,
        title: 'Check-in Due',
        date: c.scheduledFor,
        status: c.status,
        color: c.status === 'completed' ? '#22c55e' : '#8b5cf6',
      })),
    ];

    // Sort all events by date
    events.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    // Get user's profile for calculating goals
    const [user] = await db.select({
      currentWeight: users.currentWeight,
      targetWeight: users.targetWeight,
      fitnessGoal: users.fitnessGoal,
    }).from(users).where(eq(users.id, userId)).limit(1);

    // Calculate macro goals based on user profile (or use defaults)
    const calorieGoal = user?.fitnessGoal === 'lose_weight' ? 1800 :
                        user?.fitnessGoal === 'build_muscle' ? 2500 : 2000;
    const proteinGoal = user?.currentWeight ? Math.round(user.currentWeight * 2) : 150;

    return NextResponse.json({
      events,
      workouts: {
        scheduled,
        completed,
      },
      meals: {
        planned: meals,
        logged: foodLogsData,
      },
      photos: {
        all: photos,
        byDate: photosByDate,
      },
      dailyLogs: dailyLogsData,
      checkIns,
      macros: {
        byDate: macrosByDate,
        periodTotals,
        periodAverages,
        goals: {
          calories: calorieGoal,
          protein: proteinGoal,
        },
      },
      summary: {
        totalWorkouts: completed.length,
        scheduledWorkouts: scheduled.filter(s => s.status === 'scheduled').length,
        completedWorkouts: scheduled.filter(s => s.status === 'completed').length,
        skippedWorkouts: scheduled.filter(s => s.status === 'skipped').length,
        totalMeals: foodLogsData.length,
        totalPhotos: photos.length,
        daysWithData,
        totalDays,
      },
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}

// POST - Add new calendar entry (workout, meal, photo, daily log)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'scheduled_workout') {
      const { title, description, scheduledFor, duration, isRecurring, recurringPattern, recurringDays } = data;

      if (!title || !scheduledFor) {
        return NextResponse.json({ error: 'Title and scheduled date are required' }, { status: 400 });
      }

      const [scheduled] = await db.insert(scheduledWorkouts).values({
        userId,
        title,
        description,
        scheduledFor: new Date(scheduledFor),
        duration,
        isRecurring: isRecurring || false,
        recurringPattern,
        recurringDays,
        status: 'scheduled',
      }).returning();

      return NextResponse.json({ scheduled });
    }

    if (type === 'meal_plan') {
      const { name, mealType, scheduledFor, targetCalories, targetProtein, targetCarbs, targetFat, notes } = data;

      if (!name || !mealType || !scheduledFor) {
        return NextResponse.json({ error: 'Name, meal type, and date are required' }, { status: 400 });
      }

      const [meal] = await db.insert(mealPlans).values({
        userId,
        name,
        mealType,
        scheduledFor,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        notes,
        status: 'planned',
      }).returning();

      return NextResponse.json({ meal });
    }

    if (type === 'food_log') {
      const { mealType, foodName, calories, protein, carbs, fat, fiber, photoUrl, notes } = data;

      if (!mealType) {
        return NextResponse.json({ error: 'Meal type is required' }, { status: 400 });
      }

      const [log] = await db.insert(foodLogs).values({
        userId,
        mealType,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        photoUrl,
        notes,
      }).returning();

      return NextResponse.json({ foodLog: log });
    }

    if (type === 'progress_photo') {
      const { photoUrl, thumbnailUrl, photoType, weight, notes } = data;

      if (!photoUrl) {
        return NextResponse.json({ error: 'Photo URL is required' }, { status: 400 });
      }

      const [photo] = await db.insert(progressPhotos).values({
        userId,
        photoUrl,
        thumbnailUrl,
        type: photoType || 'front',
        weight,
        notes,
      }).returning();

      return NextResponse.json({ photo });
    }

    if (type === 'daily_log') {
      const { date, weight, bodyFat, mood, energyLevel, sleepHours, sleepQuality, waterIntake, stepsCount, notes } = data;

      if (!date) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 });
      }

      // Upsert daily log
      const existing = await db.select()
        .from(dailyLogs)
        .where(and(
          eq(dailyLogs.userId, userId),
          eq(dailyLogs.date, date)
        ))
        .limit(1);

      let dailyLog;
      if (existing.length > 0) {
        [dailyLog] = await db.update(dailyLogs)
          .set({
            weight,
            bodyFat,
            mood,
            energyLevel,
            sleepHours,
            sleepQuality,
            waterIntake,
            stepsCount,
            notes,
            updatedAt: new Date(),
          })
          .where(eq(dailyLogs.id, existing[0].id))
          .returning();
      } else {
        [dailyLog] = await db.insert(dailyLogs).values({
          userId,
          date,
          weight,
          bodyFat,
          mood,
          energyLevel,
          sleepHours,
          sleepQuality,
          waterIntake,
          stepsCount,
          notes,
        }).returning();
      }

      return NextResponse.json({ dailyLog });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Add calendar entry error:', error);
    return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 });
  }
}

// PATCH - Update calendar entry (complete workout, update status, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { type, id, ...data } = body;

    if (type === 'scheduled_workout') {
      const { status, completedWorkoutId } = data;

      const [updated] = await db.update(scheduledWorkouts)
        .set({
          status,
          completedWorkoutId,
        })
        .where(and(
          eq(scheduledWorkouts.id, id),
          eq(scheduledWorkouts.userId, userId)
        ))
        .returning();

      return NextResponse.json({ scheduled: updated });
    }

    if (type === 'meal_plan') {
      const { status, completedFoodLogId } = data;

      const [updated] = await db.update(mealPlans)
        .set({
          status,
          completedFoodLogId,
        })
        .where(and(
          eq(mealPlans.id, id),
          eq(mealPlans.userId, userId)
        ))
        .returning();

      return NextResponse.json({ meal: updated });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Update calendar entry error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

// DELETE - Remove calendar entry
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    if (type === 'scheduled_workout') {
      await db.delete(scheduledWorkouts)
        .where(and(
          eq(scheduledWorkouts.id, id),
          eq(scheduledWorkouts.userId, userId)
        ));
    } else if (type === 'meal_plan') {
      await db.delete(mealPlans)
        .where(and(
          eq(mealPlans.id, id),
          eq(mealPlans.userId, userId)
        ));
    } else if (type === 'food_log') {
      await db.delete(foodLogs)
        .where(and(
          eq(foodLogs.id, id),
          eq(foodLogs.userId, userId)
        ));
    } else if (type === 'progress_photo') {
      await db.delete(progressPhotos)
        .where(and(
          eq(progressPhotos.id, id),
          eq(progressPhotos.userId, userId)
        ));
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete calendar entry error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
