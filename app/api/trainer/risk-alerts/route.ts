import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { clientEngagement, trainerClients, users, workouts, scheduledWorkouts, messages } from '@/lib/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// Calculate risk score for a client
function calculateRiskScore(metrics: {
  daysSinceLastWorkout: number;
  daysSinceLastCheckIn: number;
  daysSinceLastMessage: number;
  workoutsLast7Days: number;
  workoutsLast30Days: number;
  missedScheduledWorkouts: number;
  averageWorkoutCompletion: number;
}): { score: number; level: string; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Days since last workout (max 30 points)
  if (metrics.daysSinceLastWorkout > 14) {
    score += 30;
    factors.push('No workout in 2+ weeks');
  } else if (metrics.daysSinceLastWorkout > 7) {
    score += 20;
    factors.push('No workout in 7+ days');
  } else if (metrics.daysSinceLastWorkout > 4) {
    score += 10;
    factors.push('No recent workout activity');
  }

  // Days since last check-in (max 20 points)
  if (metrics.daysSinceLastCheckIn > 14) {
    score += 20;
    factors.push('No check-in in 2+ weeks');
  } else if (metrics.daysSinceLastCheckIn > 7) {
    score += 10;
    factors.push('Missing recent check-ins');
  }

  // Workout frequency decline (max 25 points)
  if (metrics.workoutsLast7Days === 0 && metrics.workoutsLast30Days > 0) {
    score += 25;
    factors.push('Complete workout stop this week');
  } else if (metrics.workoutsLast7Days < metrics.workoutsLast30Days / 4 * 0.5) {
    score += 15;
    factors.push('Significant workout decline');
  }

  // Missed scheduled workouts (max 15 points)
  if (metrics.missedScheduledWorkouts >= 3) {
    score += 15;
    factors.push('Multiple missed scheduled sessions');
  } else if (metrics.missedScheduledWorkouts >= 1) {
    score += 8;
    factors.push('Missed scheduled workout');
  }

  // Low completion rate (max 10 points)
  if (metrics.averageWorkoutCompletion < 50) {
    score += 10;
    factors.push('Low workout completion rate');
  } else if (metrics.averageWorkoutCompletion < 75) {
    score += 5;
    factors.push('Declining completion rate');
  }

  // Determine risk level
  let level: string;
  if (score >= 60) {
    level = 'critical';
  } else if (score >= 40) {
    level = 'high';
  } else if (score >= 20) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { score: Math.min(100, score), level, factors };
}

// GET - Fetch risk alerts for trainer's clients
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    if (!isTrainer) {
      return NextResponse.json({ error: 'Trainers only' }, { status: 403 });
    }

    // Get all clients and their engagement data
    const clientsData = await db.select({
      client: users,
      engagement: clientEngagement,
      relationship: trainerClients,
    })
      .from(trainerClients)
      .leftJoin(users, eq(trainerClients.clientId, users.id))
      .leftJoin(clientEngagement, and(
        eq(clientEngagement.trainerId, session.user.id),
        eq(clientEngagement.clientId, trainerClients.clientId)
      ))
      .where(and(
        eq(trainerClients.trainerId, session.user.id),
        eq(trainerClients.status, 'active')
      ));

    // Format response with risk data
    const clientsWithRisk = clientsData.map(({ client, engagement }) => {
      const riskData = engagement ? {
        score: engagement.riskScore || 0,
        level: engagement.riskLevel || 'low',
        factors: (engagement.riskFactors as string[]) || [],
        lastWorkout: engagement.lastWorkoutAt,
        lastCheckIn: engagement.lastCheckInAt,
        workoutsLast7Days: engagement.workoutsLast7Days || 0,
        workoutsLast30Days: engagement.workoutsLast30Days || 0,
        alertSent: engagement.alertSent,
        alertDismissed: engagement.alertDismissed,
      } : {
        score: 0,
        level: 'unknown',
        factors: ['No engagement data yet'],
        lastWorkout: null,
        lastCheckIn: null,
        workoutsLast7Days: 0,
        workoutsLast30Days: 0,
        alertSent: false,
        alertDismissed: false,
      };

      return {
        id: client?.id,
        name: client?.name,
        email: client?.email,
        avatarUrl: client?.avatarUrl,
        risk: riskData,
      };
    });

    // Sort by risk score descending
    clientsWithRisk.sort((a, b) => (b.risk.score || 0) - (a.risk.score || 0));

    // Separate into categories
    const critical = clientsWithRisk.filter(c => c.risk.level === 'critical');
    const high = clientsWithRisk.filter(c => c.risk.level === 'high');
    const medium = clientsWithRisk.filter(c => c.risk.level === 'medium');
    const low = clientsWithRisk.filter(c => c.risk.level === 'low' || c.risk.level === 'unknown');

    return NextResponse.json({
      summary: {
        total: clientsWithRisk.length,
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        low: low.length,
      },
      clients: clientsWithRisk,
      alerts: [...critical, ...high], // Clients needing attention
    });
  } catch (error) {
    console.error('Risk alerts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch risk alerts' }, { status: 500 });
  }
}

// POST - Refresh/recalculate risk scores for all clients
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    if (!isTrainer) {
      return NextResponse.json({ error: 'Trainers only' }, { status: 403 });
    }

    // Get all active clients
    const clients = await db.select()
      .from(trainerClients)
      .where(and(
        eq(trainerClients.trainerId, session.user.id),
        eq(trainerClients.status, 'active')
      ));

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const client of clients) {
      // Get workout data
      const recentWorkouts = await db.select()
        .from(workouts)
        .where(and(
          eq(workouts.userId, client.clientId),
          gte(workouts.createdAt, thirtyDaysAgo)
        ));

      const workoutsLast7Days = recentWorkouts.filter(w =>
        w.createdAt && new Date(w.createdAt) >= sevenDaysAgo
      ).length;

      const workoutsLast30Days = recentWorkouts.length;

      const lastWorkout = recentWorkouts.length > 0
        ? recentWorkouts.reduce((latest, w) =>
            !latest.createdAt || (w.createdAt && w.createdAt > latest.createdAt) ? w : latest
          )
        : null;

      // Get last message
      const lastMessage = await db.select()
        .from(messages)
        .where(eq(messages.senderId, client.clientId))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      // Calculate days since activities
      const daysSinceLastWorkout = lastWorkout?.createdAt
        ? Math.floor((now.getTime() - new Date(lastWorkout.createdAt).getTime()) / (24 * 60 * 60 * 1000))
        : 999;

      const daysSinceLastMessage = lastMessage[0]?.createdAt
        ? Math.floor((now.getTime() - new Date(lastMessage[0].createdAt).getTime()) / (24 * 60 * 60 * 1000))
        : 999;

      // Calculate risk
      const { score, level, factors } = calculateRiskScore({
        daysSinceLastWorkout,
        daysSinceLastCheckIn: 999, // TODO: Integrate with check-ins
        daysSinceLastMessage,
        workoutsLast7Days,
        workoutsLast30Days,
        missedScheduledWorkouts: 0, // TODO: Calculate from scheduled workouts
        averageWorkoutCompletion: 100, // TODO: Calculate actual completion
      });

      // Upsert engagement record
      const existing = await db.select()
        .from(clientEngagement)
        .where(and(
          eq(clientEngagement.trainerId, session.user.id),
          eq(clientEngagement.clientId, client.clientId)
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(clientEngagement)
          .set({
            lastWorkoutAt: lastWorkout?.createdAt,
            lastMessageAt: lastMessage[0]?.createdAt,
            workoutsLast7Days,
            workoutsLast30Days,
            riskScore: score,
            riskLevel: level,
            riskFactors: factors,
            updatedAt: new Date(),
          })
          .where(eq(clientEngagement.id, existing[0].id));
      } else {
        await db.insert(clientEngagement).values({
          trainerId: session.user.id,
          clientId: client.clientId,
          lastWorkoutAt: lastWorkout?.createdAt,
          lastMessageAt: lastMessage[0]?.createdAt,
          workoutsLast7Days,
          workoutsLast30Days,
          riskScore: score,
          riskLevel: level,
          riskFactors: factors,
        });
      }
    }

    return NextResponse.json({
      message: 'Risk scores updated',
      clientsProcessed: clients.length
    });
  } catch (error) {
    console.error('Risk calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate risk scores' }, { status: 500 });
  }
}

// PATCH - Dismiss an alert
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, dismiss } = body;

    await db.update(clientEngagement)
      .set({
        alertDismissed: dismiss,
        updatedAt: new Date(),
      })
      .where(and(
        eq(clientEngagement.trainerId, session.user.id),
        eq(clientEngagement.clientId, clientId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Alert dismiss error:', error);
    return NextResponse.json({ error: 'Failed to dismiss alert' }, { status: 500 });
  }
}
