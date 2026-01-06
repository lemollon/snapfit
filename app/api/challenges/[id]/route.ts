import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { challenges, challengeParticipants, users } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use select API instead of query API
    const [challenge] = await db.select().from(challenges)
      .where(eq(challenges.id, params.id))
      .limit(1);

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Get participants using select API
    const participants = await db.select().from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, params.id));

    const participantIds = participants.map(p => p.userId);

    // Get participant users using select API with inArray
    const participantUsers = participantIds.length > 0
      ? await db.select({
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        }).from(users).where(inArray(users.id, participantIds))
      : [];

    const leaderboard = participants
      .map(p => {
        const user = participantUsers.find(u => u.id === p.userId);
        return {
          ...p,
          userName: user?.name || 'Unknown',
          avatarUrl: user?.avatarUrl,
        };
      })
      .sort((a, b) => (b.progress || 0) - (a.progress || 0));

    return NextResponse.json({ challenge, leaderboard });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 });
  }
}

// Join challenge
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if challenge exists using select API
    const [challenge] = await db.select().from(challenges)
      .where(eq(challenges.id, params.id))
      .limit(1);

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Check if already joined using select API
    const [existing] = await db.select().from(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, params.id),
        eq(challengeParticipants.userId, userId)
      ))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: 'Already joined this challenge' }, { status: 400 });
    }

    // Join challenge
    const [participant] = await db.insert(challengeParticipants).values({
      challengeId: params.id,
      userId,
      progress: 0,
    }).returning();

    return NextResponse.json({ participant });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}

// Update progress
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { progress } = await req.json();

    // Use select API instead of query API
    const [existing] = await db.select().from(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, params.id),
        eq(challengeParticipants.userId, userId)
      ))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 400 });
    }

    await db.update(challengeParticipants)
      .set({ progress })
      .where(eq(challengeParticipants.id, existing.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
