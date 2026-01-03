import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { personalRecords, personalRecordHistory } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch user's personal records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = db
      .select()
      .from(personalRecords)
      .where(eq(personalRecords.userId, (session.user as any).id));

    if (category && category !== 'all') {
      query = db
        .select()
        .from(personalRecords)
        .where(
          and(
            eq(personalRecords.userId, (session.user as any).id),
            eq(personalRecords.category, category)
          )
        );
    }

    const records = await query.orderBy(desc(personalRecords.achievedAt));

    // Get recent PR history
    const history = await db
      .select()
      .from(personalRecordHistory)
      .where(eq(personalRecordHistory.userId, (session.user as any).id))
      .orderBy(desc(personalRecordHistory.achievedAt))
      .limit(10);

    return NextResponse.json({ records, history });
  } catch (error) {
    console.error('Error fetching personal records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

// POST - Create or update personal record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseName, category, maxWeight, maxReps, fastestTime, longestDistance, unit, workoutId, notes } = body;

    if (!exerciseName || !category) {
      return NextResponse.json({ error: 'Exercise name and category are required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if record exists
    const existingRecords = await db
      .select()
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.userId, userId),
          eq(personalRecords.exerciseName, exerciseName)
        )
      );

    const existingRecord = existingRecords[0];
    let isNewPR = false;
    let improvement = 0;
    let previousValue = 0;
    let newValue = 0;
    let recordType = '';

    if (existingRecord) {
      // Check if this is a new PR
      if (maxWeight && (!existingRecord.maxWeight || maxWeight > existingRecord.maxWeight)) {
        isNewPR = true;
        previousValue = existingRecord.maxWeight || 0;
        newValue = maxWeight;
        recordType = 'max_weight';
        improvement = previousValue > 0 ? ((newValue - previousValue) / previousValue) * 100 : 100;
      }
      if (maxReps && (!existingRecord.maxReps || maxReps > existingRecord.maxReps)) {
        isNewPR = true;
        previousValue = existingRecord.maxReps || 0;
        newValue = maxReps;
        recordType = 'max_reps';
        improvement = previousValue > 0 ? ((newValue - previousValue) / previousValue) * 100 : 100;
      }

      if (isNewPR) {
        // Update existing record
        await db
          .update(personalRecords)
          .set({
            maxWeight: maxWeight || existingRecord.maxWeight,
            maxReps: maxReps || existingRecord.maxReps,
            fastestTime: fastestTime || existingRecord.fastestTime,
            longestDistance: longestDistance || existingRecord.longestDistance,
            achievedAt: new Date(),
            workoutId,
            notes,
            updatedAt: new Date(),
          })
          .where(eq(personalRecords.id, existingRecord.id));

        // Add to history
        await db.insert(personalRecordHistory).values({
          userId,
          personalRecordId: existingRecord.id,
          exerciseName,
          recordType,
          previousValue,
          newValue,
          improvement,
          workoutId,
          celebrationShown: false,
        });

        return NextResponse.json({
          success: true,
          isNewPR: true,
          improvement,
          recordType,
          message: `New PR! +${improvement.toFixed(1)}% improvement!`
        });
      } else {
        return NextResponse.json({ success: true, isNewPR: false, message: 'No new record set' });
      }
    } else {
      // Create new record
      const [newRecord] = await db
        .insert(personalRecords)
        .values({
          userId,
          exerciseName,
          category,
          maxWeight,
          maxReps,
          fastestTime,
          longestDistance,
          unit: unit || 'kg',
          workoutId,
          notes,
        })
        .returning();

      // Add first PR to history
      await db.insert(personalRecordHistory).values({
        userId,
        personalRecordId: newRecord.id,
        exerciseName,
        recordType: maxWeight ? 'max_weight' : maxReps ? 'max_reps' : 'other',
        previousValue: 0,
        newValue: maxWeight || maxReps || 0,
        improvement: 100,
        workoutId,
        celebrationShown: false,
      });

      return NextResponse.json({
        success: true,
        isNewPR: true,
        record: newRecord,
        message: 'First PR recorded!'
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating personal record:', error);
    return NextResponse.json({ error: 'Failed to save record' }, { status: 500 });
  }
}
