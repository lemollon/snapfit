import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { globalChallenges, globalChallengeParticipants, users } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

// GET - Fetch global challenges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // active, upcoming, completed
    const featured = searchParams.get('featured');

    const session = await getServerSession();
    const userId = session?.user ? (session.user as any).id : null;

    const now = new Date();

    // Build query conditions
    let conditions: any[] = [eq(globalChallenges.isActive, true)];

    if (status === 'active') {
      conditions.push(lte(globalChallenges.startDate, now));
      conditions.push(gte(globalChallenges.endDate, now));
    } else if (status === 'upcoming') {
      conditions.push(gte(globalChallenges.startDate, now));
    } else if (status === 'completed') {
      conditions.push(lte(globalChallenges.endDate, now));
    }

    if (featured === 'true') {
      conditions.push(eq(globalChallenges.isFeatured, true));
    }

    // Get challenges
    const challenges = await db
      .select()
      .from(globalChallenges)
      .where(and(...conditions))
      .orderBy(desc(globalChallenges.isFeatured), desc(globalChallenges.participantCount));

    // If user is logged in, get their participation status
    let userParticipations: any[] = [];
    if (userId) {
      userParticipations = await db
        .select()
        .from(globalChallengeParticipants)
        .where(eq(globalChallengeParticipants.userId, userId));
    }

    // Combine challenges with user participation
    const challengesWithStatus = challenges.map(challenge => {
      const participation = userParticipations.find(p => p.challengeId === challenge.id);
      const endDate = new Date(challenge.endDate);
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        ...challenge,
        isJoined: !!participation,
        progress: participation?.progress || 0,
        rank: participation?.rank,
        isCompleted: participation?.completed || false,
        daysLeft,
      };
    });

    return NextResponse.json(challengesWithStatus);
  } catch (error) {
    console.error('Error fetching global challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

// POST - Join a challenge
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if challenge exists and is active
    const challenge = await db
      .select()
      .from(globalChallenges)
      .where(eq(globalChallenges.id, challengeId));

    if (challenge.length === 0) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const now = new Date();
    if (new Date(challenge[0].endDate) < now) {
      return NextResponse.json({ error: 'Challenge has ended' }, { status: 400 });
    }

    // Check if already joined
    const existing = await db
      .select()
      .from(globalChallengeParticipants)
      .where(and(
        eq(globalChallengeParticipants.challengeId, challengeId),
        eq(globalChallengeParticipants.userId, userId)
      ));

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already joined this challenge' }, { status: 400 });
    }

    // Check max participants
    if (challenge[0].maxParticipants && (challenge[0].participantCount || 0) >= challenge[0].maxParticipants) {
      return NextResponse.json({ error: 'Challenge is full' }, { status: 400 });
    }

    // Check min level
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length > 0 && challenge[0].minLevel && (user[0].level || 1) < challenge[0].minLevel) {
      return NextResponse.json({ error: `Must be level ${challenge[0].minLevel} or higher` }, { status: 400 });
    }

    // Join the challenge
    const [participation] = await db
      .insert(globalChallengeParticipants)
      .values({
        challengeId,
        userId,
        progress: 0,
        rank: (challenge[0].participantCount || 0) + 1,
      })
      .returning();

    // Update participant count
    await db
      .update(globalChallenges)
      .set({ participantCount: (challenge[0].participantCount || 0) + 1 })
      .where(eq(globalChallenges.id, challengeId));

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
