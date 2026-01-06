import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { workouts, exercises } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get workout using select API
    const [workout] = await db.select().from(workouts)
      .where(eq(workouts.id, params.id))
      .limit(1);

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Check if user can access (owner or public)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!workout.isPublic && workout.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get exercises for this workout
    const workoutExercises = await db.select().from(exercises)
      .where(eq(exercises.workoutId, params.id));

    return NextResponse.json({ workout: { ...workout, exercises: workoutExercises } });
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify ownership using select API
    const [workout] = await db.select().from(workouts)
      .where(and(eq(workouts.id, params.id), eq(workouts.userId, userId)))
      .limit(1);

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found or unauthorized' }, { status: 404 });
    }

    // Delete workout (exercises cascade delete)
    await db.delete(workouts).where(eq(workouts.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
