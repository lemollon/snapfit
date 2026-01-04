import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, weightLogs } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// GET - Fetch weight history
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '90');

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db
      .select()
      .from(weightLogs)
      .where(
        and(
          eq(weightLogs.userId, user.id),
          gte(weightLogs.loggedAt, startDate)
        )
      )
      .orderBy(desc(weightLogs.loggedAt));

    // Calculate stats
    const latestWeight = logs[0]?.weight || null;
    const oldestWeight = logs[logs.length - 1]?.weight || null;
    const weightChange = latestWeight && oldestWeight ? latestWeight - oldestWeight : null;

    return NextResponse.json({
      logs,
      stats: {
        latestWeight,
        oldestWeight,
        weightChange,
        totalLogs: logs.length,
      },
    });
  } catch (error) {
    console.error('Get weight logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch weight logs' }, { status: 500 });
  }
}

// POST - Log new weight
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weight, unit, notes } = await req.json();

    if (!weight || typeof weight !== 'number' || weight <= 0 || weight > 1000) {
      return NextResponse.json({ error: 'Valid weight is required (0-1000)' }, { status: 400 });
    }

    // Validate unit
    const validUnits = ['kg', 'lbs'];
    if (unit && !validUnits.includes(unit)) {
      return NextResponse.json({ error: 'Unit must be kg or lbs' }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create weight log
    const [newLog] = await db
      .insert(weightLogs)
      .values({
        userId: user.id,
        weight,
        unit: unit || 'kg',
        notes,
      })
      .returning();

    // Also update current weight on user profile
    await db
      .update(users)
      .set({ currentWeight: weight, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ log: newLog });
  } catch (error) {
    console.error('Log weight error:', error);
    return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
  }
}
