import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { challenges, challengeParticipants, users, Challenge } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'my', 'joined', 'public'

    let allChallenges: Challenge[] = [];

    if (type === 'my') {
      // Challenges created by user - use select API
      allChallenges = await db.select().from(challenges)
        .where(eq(challenges.creatorId, userId))
        .orderBy(desc(challenges.createdAt));
    } else if (type === 'joined') {
      // Challenges user has joined - use select API
      const participations = await db.select().from(challengeParticipants)
        .where(eq(challengeParticipants.userId, userId));

      const challengeIds = participations.map(p => p.challengeId);

      if (challengeIds.length > 0) {
        allChallenges = await db.select().from(challenges)
          .where(inArray(challenges.id, challengeIds))
          .orderBy(desc(challenges.startDate));
      } else {
        allChallenges = [];
      }
    } else {
      // Public active challenges - use select API
      allChallenges = await db.select().from(challenges)
        .where(eq(challenges.isPublic, true))
        .orderBy(desc(challenges.createdAt))
        .limit(20);
    }

    // Get participant counts for each challenge
    const challengesWithCounts = await Promise.all(
      allChallenges.map(async (challenge) => {
        // Use select API instead of query API
        const participants = await db.select().from(challengeParticipants)
          .where(eq(challengeParticipants.challengeId, challenge.id));

        const isJoined = participants.some(p => p.userId === userId);
        const userProgress = participants.find(p => p.userId === userId)?.progress || 0;

        return {
          ...challenge,
          participantCount: participants.length,
          isJoined,
          userProgress,
        };
      })
    );

    return NextResponse.json({ challenges: challengesWithCounts });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
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
    const { name, description, type, goal, startDate, endDate, isPublic } = body;

    const [newChallenge] = await db.insert(challenges).values({
      creatorId: userId,
      name,
      description,
      type,
      goal,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isPublic: isPublic ?? true,
    }).returning();

    // Auto-join creator to the challenge
    await db.insert(challengeParticipants).values({
      challengeId: newChallenge.id,
      userId,
      progress: 0,
    });

    return NextResponse.json({ challenge: newChallenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
