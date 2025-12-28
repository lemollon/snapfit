import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, bodyMeasurements } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Fetch measurement history
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const measurements = await db
      .select()
      .from(bodyMeasurements)
      .where(eq(bodyMeasurements.userId, user.id))
      .orderBy(desc(bodyMeasurements.measuredAt))
      .limit(limit);

    // Calculate changes between most recent and oldest
    const latest = measurements[0];
    const oldest = measurements[measurements.length - 1];

    let changes: Record<string, number | null> = {};
    if (latest && oldest && measurements.length > 1) {
      const fields = ['chest', 'waist', 'hips', 'leftArm', 'rightArm', 'leftThigh', 'rightThigh'];
      fields.forEach(field => {
        const latestVal = latest[field as keyof typeof latest] as number | null;
        const oldestVal = oldest[field as keyof typeof oldest] as number | null;
        if (latestVal && oldestVal) {
          changes[field] = latestVal - oldestVal;
        }
      });
    }

    return NextResponse.json({
      measurements,
      latest,
      changes,
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    return NextResponse.json({ error: 'Failed to fetch measurements' }, { status: 500 });
  }
}

// POST - Log new measurements
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      chest,
      waist,
      hips,
      leftArm,
      rightArm,
      leftThigh,
      rightThigh,
      leftCalf,
      rightCalf,
      neck,
      shoulders,
      bodyFatPercent,
      unit,
      notes,
    } = body;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [newMeasurement] = await db
      .insert(bodyMeasurements)
      .values({
        userId: user.id,
        chest,
        waist,
        hips,
        leftArm,
        rightArm,
        leftThigh,
        rightThigh,
        leftCalf,
        rightCalf,
        neck,
        shoulders,
        bodyFatPercent,
        unit: unit || 'cm',
        notes,
      })
      .returning();

    return NextResponse.json({ measurement: newMeasurement });
  } catch (error) {
    console.error('Log measurements error:', error);
    return NextResponse.json({ error: 'Failed to log measurements' }, { status: 500 });
  }
}
