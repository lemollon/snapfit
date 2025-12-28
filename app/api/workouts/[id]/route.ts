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
    const workout = await db.query.workouts.findFirst({
      where: eq(workouts.id, params.id),
      with: {
        exercises: true,
      },
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Check if user can access (owner or public)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!workout.isPublic && workout.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ workout });
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

    // Verify ownership
    const workout = await db.query.workouts.findFirst({
      where: and(eq(workouts.id, params.id), eq(workouts.userId, userId)),
    });

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
