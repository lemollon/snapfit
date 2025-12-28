import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, scheduledWorkouts, mealPlans, workouts, foodLogs } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// GET - Fetch calendar events for a date range
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get scheduled workouts
    const scheduled = await db
      .select()
      .from(scheduledWorkouts)
      .where(
        and(
          eq(scheduledWorkouts.userId, user.id),
          gte(scheduledWorkouts.scheduledFor, start),
          lte(scheduledWorkouts.scheduledFor, end)
        )
      )
      .orderBy(scheduledWorkouts.scheduledFor);

    // Get completed workouts in range
    const completed = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, user.id),
          gte(workouts.createdAt, start),
          lte(workouts.createdAt, end)
        )
      )
      .orderBy(workouts.createdAt);

    // Get meal plans in range
    const meals = await db
      .select()
      .from(mealPlans)
      .where(
        and(
          eq(mealPlans.userId, user.id),
          gte(mealPlans.scheduledFor, start.toISOString().split('T')[0]),
          lte(mealPlans.scheduledFor, end.toISOString().split('T')[0])
        )
      );

    // Get food logs in range
    const foodLogsInRange = await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, user.id),
          gte(foodLogs.loggedAt, start),
          lte(foodLogs.loggedAt, end)
        )
      )
      .orderBy(foodLogs.loggedAt);

    // Format events for calendar display
    const events = [
      ...scheduled.map(s => ({
        id: s.id,
        type: 'scheduled_workout' as const,
        title: s.title,
        date: s.scheduledFor,
        status: s.status,
        duration: s.duration,
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
        color: m.status === 'logged' ? '#22c55e' : '#f59e0b',
      })),
      ...foodLogsInRange.map(f => ({
        id: f.id,
        type: 'food_log' as const,
        title: f.foodName || 'Meal',
        date: f.loggedAt,
        mealType: f.mealType,
        calories: f.calories,
        color: '#10b981',
      })),
    ];

    // Sort all events by date
    events.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}

// POST - Schedule a new workout
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      scheduledFor,
      duration,
      isRecurring,
      recurringPattern,
      recurringDays,
      reminderMinutes,
    } = body;

    if (!title || !scheduledFor) {
      return NextResponse.json({ error: 'Title and scheduled date are required' }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [scheduled] = await db
      .insert(scheduledWorkouts)
      .values({
        userId: user.id,
        title,
        description,
        scheduledFor: new Date(scheduledFor),
        duration,
        isRecurring: isRecurring || false,
        recurringPattern,
        recurringDays,
        reminderMinutes: reminderMinutes || 30,
        status: 'scheduled',
      })
      .returning();

    return NextResponse.json({ scheduled });
  } catch (error) {
    console.error('Schedule workout error:', error);
    return NextResponse.json({ error: 'Failed to schedule workout' }, { status: 500 });
  }
}
