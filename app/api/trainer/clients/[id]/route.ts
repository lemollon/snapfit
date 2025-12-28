import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, trainerClients, workouts, foodLogs, exercises } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET - Get detailed client info including their workouts and food logs
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    // Get trainer
    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer?.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    // Verify this client belongs to this trainer
    const [relation] = await db
      .select()
      .from(trainerClients)
      .where(
        and(
          eq(trainerClients.trainerId, trainer.id),
          eq(trainerClients.clientId, clientId)
        )
      )
      .limit(1);

    if (!relation) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get client details
    const [client] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: 'Client user not found' }, { status: 404 });
    }

    // Get client's recent workouts (last 10)
    const clientWorkouts = await db
      .select({
        id: workouts.id,
        title: workouts.title,
        duration: workouts.duration,
        fitnessLevel: workouts.fitnessLevel,
        equipment: workouts.equipment,
        notes: workouts.notes,
        createdAt: workouts.createdAt,
      })
      .from(workouts)
      .where(eq(workouts.userId, clientId))
      .orderBy(desc(workouts.createdAt))
      .limit(10);

    // Get client's recent food logs (last 10)
    const clientFoodLogs = await db
      .select({
        id: foodLogs.id,
        mealType: foodLogs.mealType,
        foodName: foodLogs.foodName,
        calories: foodLogs.calories,
        protein: foodLogs.protein,
        carbs: foodLogs.carbs,
        fat: foodLogs.fat,
        photoUrl: foodLogs.photoUrl,
        loggedAt: foodLogs.loggedAt,
      })
      .from(foodLogs)
      .where(eq(foodLogs.userId, clientId))
      .orderBy(desc(foodLogs.loggedAt))
      .limit(10);

    // Calculate stats
    const allWorkouts = await db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, clientId));

    const allFoodLogs = await db
      .select()
      .from(foodLogs)
      .where(eq(foodLogs.userId, clientId));

    const totalMinutes = allWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgCalories = allFoodLogs.length > 0
      ? Math.round(allFoodLogs.reduce((sum, f) => sum + (f.calories || 0), 0) / allFoodLogs.length)
      : 0;

    return NextResponse.json({
      client: {
        ...client,
        relationStatus: relation.status,
        joinedTrainerAt: relation.createdAt,
      },
      stats: {
        totalWorkouts: allWorkouts.length,
        totalFoodLogs: allFoodLogs.length,
        totalMinutes,
        avgCaloriesPerMeal: avgCalories,
      },
      recentWorkouts: clientWorkouts,
      recentFoodLogs: clientFoodLogs,
    });
  } catch (error) {
    console.error('Get client detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}

// PATCH - Update client relationship (activate, end)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;
    const { status } = await req.json();

    if (!['active', 'ended', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get trainer
    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer?.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    // Update relationship
    const [updated] = await db
      .update(trainerClients)
      .set({ status })
      .where(
        and(
          eq(trainerClients.trainerId, trainer.id),
          eq(trainerClients.clientId, clientId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Client relationship not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error('Update client error:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE - Remove client
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    // Get trainer
    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer?.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    // Delete relationship
    await db
      .delete(trainerClients)
      .where(
        and(
          eq(trainerClients.trainerId, trainer.id),
          eq(trainerClients.clientId, clientId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete client error:', error);
    return NextResponse.json({ error: 'Failed to remove client' }, { status: 500 });
  }
}
