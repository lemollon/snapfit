import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { foodLogs, dailyStats } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let logs;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Use select API instead of query API
      logs = await db.select().from(foodLogs)
        .where(and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.loggedAt, startOfDay),
          lte(foodLogs.loggedAt, endOfDay)
        ))
        .orderBy(desc(foodLogs.loggedAt));
    } else {
      // Use select API instead of query API
      logs = await db.select().from(foodLogs)
        .where(eq(foodLogs.userId, userId))
        .orderBy(desc(foodLogs.loggedAt))
        .limit(50);
    }

    return NextResponse.json({ foodLogs: logs });
  } catch (error) {
    console.error('Error fetching food logs:', error);
    return NextResponse.json({ error: 'Failed to fetch food logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { photoUrl, mealType, foodName, calories, protein, carbs, fat, fiber, analysis, notes } = body;

    // Validate mealType
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (mealType && !validMealTypes.includes(mealType)) {
      return NextResponse.json({ error: 'Invalid meal type' }, { status: 400 });
    }

    // Validate numeric fields are non-negative
    const numericFields = { calories, protein, carbs, fat, fiber };
    for (const [field, value] of Object.entries(numericFields)) {
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || value < 0 || value > 50000) {
          return NextResponse.json({ error: `Invalid ${field} value` }, { status: 400 });
        }
      }
    }

    // Validate string lengths
    if (foodName && foodName.length > 500) {
      return NextResponse.json({ error: 'Food name too long (max 500 chars)' }, { status: 400 });
    }
    if (notes && notes.length > 2000) {
      return NextResponse.json({ error: 'Notes too long (max 2000 chars)' }, { status: 400 });
    }

    const [newLog] = await db.insert(foodLogs).values({
      userId,
      photoUrl,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      analysis,
      notes,
    }).returning();

    // Update daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use select API instead of query API
    const [existingStats] = await db.select().from(dailyStats)
      .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, today)))
      .limit(1);

    if (existingStats) {
      await db.update(dailyStats)
        .set({
          caloriesIn: (existingStats.caloriesIn || 0) + (calories || 0),
          proteinTotal: (existingStats.proteinTotal || 0) + (protein || 0),
        })
        .where(eq(dailyStats.id, existingStats.id));
    } else {
      await db.insert(dailyStats).values({
        userId,
        date: today,
        caloriesIn: calories || 0,
        proteinTotal: protein || 0,
      });
    }

    return NextResponse.json({ foodLog: newLog });
  } catch (error) {
    console.error('Error creating food log:', error);
    return NextResponse.json({ error: 'Failed to create food log' }, { status: 500 });
  }
}
