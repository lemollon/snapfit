import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { workouts, exercises } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const userWorkouts = await db.query.workouts.findMany({
      where: eq(workouts.userId, userId),
      orderBy: [desc(workouts.createdAt)],
      with: {
        exercises: true,
      },
    });

    return NextResponse.json({ workouts: userWorkouts });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
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
    const { title, duration, fitnessLevel, equipment, notes, isPublic, exerciseList } = body;

    // Generate share code if public
    const shareCode = isPublic ? Math.random().toString(36).substring(2, 10) : null;

    // Create workout
    const [newWorkout] = await db.insert(workouts).values({
      userId,
      title,
      duration,
      fitnessLevel,
      equipment: equipment || [],
      notes,
      isPublic: isPublic || false,
      shareCode,
    }).returning();

    // Create exercises if provided
    if (exerciseList && exerciseList.length > 0) {
      const exerciseValues = exerciseList.map((ex: any, index: number) => ({
        workoutId: newWorkout.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        duration: ex.duration,
        equipment: ex.equipment,
        tips: ex.tips,
        description: ex.description,
        videoUrl: ex.videoUrl,
        category: ex.category || 'main',
        orderIndex: index,
      }));

      await db.insert(exercises).values(exerciseValues);
    }

    return NextResponse.json({ workout: newWorkout });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}
