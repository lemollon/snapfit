import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { recoveryLogs, workouts, dailyStats } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// Calculate recovery score based on various factors
function calculateRecoveryScore(data: {
  sleepHours?: number;
  sleepQuality?: number;
  energyLevel?: number;
  stressLevel?: number;
  muscleSoreness?: number;
  mood?: number;
  restingHeartRate?: number;
  hrv?: number;
  recentWorkoutIntensity?: number;
}): { score: number; recommendedIntensity: string; factors: string[] } {
  let score = 100;
  const factors: string[] = [];

  // Sleep impact (30% weight)
  if (data.sleepHours) {
    if (data.sleepHours < 6) {
      score -= 20;
      factors.push('Low sleep duration');
    } else if (data.sleepHours < 7) {
      score -= 10;
      factors.push('Suboptimal sleep duration');
    } else if (data.sleepHours >= 8) {
      factors.push('Great sleep duration');
    }
  }

  if (data.sleepQuality) {
    if (data.sleepQuality <= 4) {
      score -= 15;
      factors.push('Poor sleep quality');
    } else if (data.sleepQuality <= 6) {
      score -= 8;
    }
  }

  // Energy and motivation (20% weight)
  if (data.energyLevel) {
    if (data.energyLevel <= 3) {
      score -= 15;
      factors.push('Low energy levels');
    } else if (data.energyLevel <= 5) {
      score -= 8;
    }
  }

  // Stress impact (15% weight)
  if (data.stressLevel) {
    if (data.stressLevel >= 8) {
      score -= 15;
      factors.push('High stress levels');
    } else if (data.stressLevel >= 6) {
      score -= 8;
      factors.push('Elevated stress');
    }
  }

  // Muscle soreness (20% weight)
  if (data.muscleSoreness) {
    if (data.muscleSoreness >= 8) {
      score -= 20;
      factors.push('Significant muscle soreness');
    } else if (data.muscleSoreness >= 6) {
      score -= 10;
      factors.push('Moderate muscle soreness');
    }
  }

  // Mood (10% weight)
  if (data.mood) {
    if (data.mood <= 3) {
      score -= 10;
      factors.push('Low mood');
    }
  }

  // HRV if available (bonus)
  if (data.hrv) {
    if (data.hrv > 60) {
      score += 5;
      factors.push('Good HRV reading');
    } else if (data.hrv < 40) {
      score -= 10;
      factors.push('Low HRV - body under stress');
    }
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine recommended intensity
  let recommendedIntensity: string;
  if (score >= 85) {
    recommendedIntensity = 'max';
  } else if (score >= 70) {
    recommendedIntensity = 'high';
  } else if (score >= 50) {
    recommendedIntensity = 'moderate';
  } else if (score >= 30) {
    recommendedIntensity = 'light';
  } else {
    recommendedIntensity = 'rest';
  }

  return { score, recommendedIntensity, factors };
}

// GET - Fetch recovery logs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db.select()
      .from(recoveryLogs)
      .where(and(
        eq(recoveryLogs.userId, session.user.id),
        gte(recoveryLogs.date, startDate.toISOString().split('T')[0])
      ))
      .orderBy(desc(recoveryLogs.date));

    // Get today's log specifically
    const today = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(l => l.date === today);

    return NextResponse.json({
      logs,
      todayLog,
      hasLoggedToday: !!todayLog
    });
  } catch (error) {
    console.error('Recovery log fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch recovery logs' }, { status: 500 });
  }
}

// POST - Log today's recovery data
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const today = new Date().toISOString().split('T')[0];

    const {
      sleepHours,
      sleepQuality,
      energyLevel,
      motivation,
      stressLevel,
      muscleSoreness,
      mood,
      restingHeartRate,
      hrv,
      notes
    } = body;

    // Calculate recovery score
    const { score, recommendedIntensity, factors } = calculateRecoveryScore({
      sleepHours,
      sleepQuality,
      energyLevel,
      stressLevel,
      muscleSoreness,
      mood,
      restingHeartRate,
      hrv
    });

    // Upsert (insert or update) today's log
    const existingLog = await db.select()
      .from(recoveryLogs)
      .where(and(
        eq(recoveryLogs.userId, session.user.id),
        eq(recoveryLogs.date, today)
      ))
      .limit(1);

    let log;
    if (existingLog.length > 0) {
      [log] = await db.update(recoveryLogs)
        .set({
          sleepHours,
          sleepQuality,
          energyLevel,
          motivation,
          stressLevel,
          muscleSoreness,
          mood,
          restingHeartRate,
          hrv,
          notes,
          recoveryScore: score,
          recommendedIntensity,
        })
        .where(eq(recoveryLogs.id, existingLog[0].id))
        .returning();
    } else {
      [log] = await db.insert(recoveryLogs).values({
        userId: session.user.id,
        date: today,
        sleepHours,
        sleepQuality,
        energyLevel,
        motivation,
        stressLevel,
        muscleSoreness,
        mood,
        restingHeartRate,
        hrv,
        notes,
        recoveryScore: score,
        recommendedIntensity,
      }).returning();
    }

    return NextResponse.json({
      log,
      score,
      recommendedIntensity,
      factors,
      message: getRecoveryMessage(score, recommendedIntensity)
    });
  } catch (error) {
    console.error('Recovery log error:', error);
    return NextResponse.json({ error: 'Failed to log recovery data' }, { status: 500 });
  }
}

function getRecoveryMessage(score: number, intensity: string): string {
  if (score >= 85) {
    return "You're fully recovered! Go crush your workout today. 💪";
  } else if (score >= 70) {
    return "Good recovery. You can train hard today, just listen to your body.";
  } else if (score >= 50) {
    return "Moderate recovery. Consider a moderate intensity workout or active recovery.";
  } else if (score >= 30) {
    return "Your body needs more rest. Light activity like walking or stretching is recommended.";
  } else {
    return "Take a rest day. Your body needs time to recover. Focus on sleep and nutrition.";
  }
}
