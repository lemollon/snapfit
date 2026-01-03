import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { habits, habitLogs } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET - Fetch user's habits with today's status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const today = new Date().toISOString().split('T')[0];

    // Get all habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
      .orderBy(habits.sortOrder);

    // Get today's logs for these habits
    const todayLogs = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, today)));

    // Get week's logs for streak display
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStart = weekAgo.toISOString().split('T')[0];

    const weekLogs = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.userId, userId)))
      .orderBy(desc(habitLogs.date));

    // Return habits with today's logs and week logs
    return NextResponse.json({
      habits: userHabits,
      todayLogs,
      weekLogs: weekLogs.filter(log => log.date && log.date >= weekStart),
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

// POST - Create new habit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon, color, type, targetValue, unit, frequency, reminderTime } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Get max sort order
    const existingHabits = await db
      .select({ sortOrder: habits.sortOrder })
      .from(habits)
      .where(eq(habits.userId, (session.user as any).id))
      .orderBy(desc(habits.sortOrder))
      .limit(1);

    const nextSortOrder = existingHabits.length > 0 ? (existingHabits[0].sortOrder || 0) + 1 : 0;

    const [habit] = await db
      .insert(habits)
      .values({
        userId: (session.user as any).id,
        name,
        description,
        icon: icon || 'check',
        color: color || 'violet',
        type,
        targetValue,
        unit,
        frequency: frequency || 'daily',
        reminderTime,
        reminderEnabled: !!reminderTime,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}

// PATCH - Update habit progress for today
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { habitId, value, completed, notes } = body;

    if (!habitId) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const today = new Date().toISOString().split('T')[0];

    // Check if log exists for today
    const existingLogs = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, today)));

    if (existingLogs.length > 0) {
      // Update existing log
      const [updatedLog] = await db
        .update(habitLogs)
        .set({
          value: value ?? existingLogs[0].value,
          completed: completed ?? existingLogs[0].completed,
          notes: notes ?? existingLogs[0].notes,
          completedAt: completed ? new Date() : existingLogs[0].completedAt,
        })
        .where(eq(habitLogs.id, existingLogs[0].id))
        .returning();

      // Update streak if completed
      if (completed && !existingLogs[0].completed) {
        await updateHabitStreak(habitId, true);
      } else if (!completed && existingLogs[0].completed) {
        await updateHabitStreak(habitId, false);
      }

      return NextResponse.json(updatedLog);
    } else {
      // Create new log
      const [newLog] = await db
        .insert(habitLogs)
        .values({
          userId,
          habitId,
          date: today,
          value,
          completed: completed || false,
          notes,
          completedAt: completed ? new Date() : null,
        })
        .returning();

      // Update streak if completed
      if (completed) {
        await updateHabitStreak(habitId, true);
      }

      return NextResponse.json(newLog, { status: 201 });
    }
  } catch (error) {
    console.error('Error updating habit log:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

async function updateHabitStreak(habitId: string, increment: boolean) {
  const habitData = await db.select().from(habits).where(eq(habits.id, habitId));
  if (habitData.length === 0) return;

  const habit = habitData[0];
  const newStreak = increment ? (habit.currentStreak || 0) + 1 : 0;
  const newLongest = Math.max(newStreak, habit.longestStreak || 0);
  const newTotal = increment ? (habit.totalCompletions || 0) + 1 : habit.totalCompletions;

  await db
    .update(habits)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalCompletions: newTotal,
    })
    .where(eq(habits.id, habitId));
}
