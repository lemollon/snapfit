import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, trainerClients, workouts, foodLogs } from '@/lib/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';

// GET - Fetch trainer's clients with their stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trainer's user record
    const [trainer] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!trainer) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!trainer.isTrainer) {
      return NextResponse.json({ error: 'Not a trainer account' }, { status: 403 });
    }

    // Get all clients for this trainer
    const clientRelations = await db
      .select({
        id: trainerClients.id,
        clientId: trainerClients.clientId,
        status: trainerClients.status,
        createdAt: trainerClients.createdAt,
        clientName: users.name,
        clientEmail: users.email,
        clientAvatar: users.avatarUrl,
      })
      .from(trainerClients)
      .leftJoin(users, eq(trainerClients.clientId, users.id))
      .where(eq(trainerClients.trainerId, trainer.id))
      .orderBy(desc(trainerClients.createdAt));

    // Get workout counts for each client
    const clientIds = clientRelations.map(c => c.clientId);

    let clientStats: Record<string, { workoutCount: number; foodLogCount: number; lastActivity: string | null }> = {};

    if (clientIds.length > 0) {
      // Get workout counts
      const workoutCounts = await db
        .select({
          userId: workouts.userId,
          count: count(),
          lastWorkout: sql<string>`MAX(${workouts.createdAt})`,
        })
        .from(workouts)
        .where(sql`${workouts.userId} IN ${clientIds}`)
        .groupBy(workouts.userId);

      // Get food log counts
      const foodCounts = await db
        .select({
          userId: foodLogs.userId,
          count: count(),
          lastLog: sql<string>`MAX(${foodLogs.loggedAt})`,
        })
        .from(foodLogs)
        .where(sql`${foodLogs.userId} IN ${clientIds}`)
        .groupBy(foodLogs.userId);

      // Build stats map
      workoutCounts.forEach(w => {
        clientStats[w.userId] = {
          workoutCount: Number(w.count),
          foodLogCount: 0,
          lastActivity: w.lastWorkout,
        };
      });

      foodCounts.forEach(f => {
        if (!clientStats[f.userId]) {
          clientStats[f.userId] = {
            workoutCount: 0,
            foodLogCount: Number(f.count),
            lastActivity: f.lastLog,
          };
        } else {
          clientStats[f.userId].foodLogCount = Number(f.count);
          // Update last activity if food log is more recent
          if (f.lastLog && (!clientStats[f.userId].lastActivity || f.lastLog > clientStats[f.userId].lastActivity!)) {
            clientStats[f.userId].lastActivity = f.lastLog;
          }
        }
      });
    }

    // Combine client data with stats
    const clients = clientRelations.map(client => ({
      id: client.id,
      clientId: client.clientId,
      name: client.clientName,
      email: client.clientEmail,
      avatarUrl: client.clientAvatar,
      status: client.status,
      joinedAt: client.createdAt,
      workoutCount: clientStats[client.clientId]?.workoutCount || 0,
      foodLogCount: clientStats[client.clientId]?.foodLogCount || 0,
      lastActivity: clientStats[client.clientId]?.lastActivity || null,
    }));

    // Split by status
    const activeClients = clients.filter(c => c.status === 'active');
    const pendingClients = clients.filter(c => c.status === 'pending');

    return NextResponse.json({
      clients: activeClients,
      pending: pendingClients,
      totalClients: activeClients.length,
    });
  } catch (error) {
    console.error('Trainer clients API error:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST - Invite a new client
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientEmail } = await req.json();

    if (!clientEmail) {
      return NextResponse.json({ error: 'Client email is required' }, { status: 400 });
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

    // Find client by email
    const [client] = await db
      .select()
      .from(users)
      .where(eq(users.email, clientEmail))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: 'User not found. They need to create an account first.' }, { status: 404 });
    }

    if (client.id === trainer.id) {
      return NextResponse.json({ error: 'Cannot add yourself as a client' }, { status: 400 });
    }

    // Check if relationship already exists
    const [existing] = await db
      .select()
      .from(trainerClients)
      .where(
        and(
          eq(trainerClients.trainerId, trainer.id),
          eq(trainerClients.clientId, client.id)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'Client already added' }, { status: 400 });
    }

    // Create trainer-client relationship
    const [newRelation] = await db
      .insert(trainerClients)
      .values({
        trainerId: trainer.id,
        clientId: client.id,
        status: 'pending',
      })
      .returning();

    return NextResponse.json({
      success: true,
      client: {
        id: newRelation.id,
        clientId: client.id,
        name: client.name,
        email: client.email,
        status: 'pending',
      },
    });
  } catch (error) {
    console.error('Add client error:', error);
    return NextResponse.json({ error: 'Failed to add client' }, { status: 500 });
  }
}
