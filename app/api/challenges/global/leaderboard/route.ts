import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { globalChallengeParticipants, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch leaderboard for a challenge
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const session = await getServerSession();
    const userId = session?.user ? (session.user as any).id : null;

    // Get top participants
    const topParticipants = await db
      .select({
        id: globalChallengeParticipants.id,
        rank: globalChallengeParticipants.rank,
        progress: globalChallengeParticipants.progress,
        completed: globalChallengeParticipants.completed,
        userId: globalChallengeParticipants.userId,
        userName: users.name,
        userLevel: users.level,
        userAvatar: users.avatarUrl,
      })
      .from(globalChallengeParticipants)
      .leftJoin(users, eq(globalChallengeParticipants.userId, users.id))
      .where(eq(globalChallengeParticipants.challengeId, challengeId))
      .orderBy(desc(globalChallengeParticipants.progress))
      .limit(limit);

    // Format leaderboard
    const leaderboard = topParticipants.map((p, index) => ({
      rank: index + 1,
      name: p.userName || 'Anonymous',
      avatar: p.userAvatar || getDefaultAvatar(index),
      progress: p.progress || 0,
      level: p.userLevel || 1,
      isCurrentUser: p.userId === userId,
      completed: p.completed,
    }));

    // Get current user's position if not in top
    let currentUserPosition = null;
    if (userId) {
      const userInTop = leaderboard.find(p => p.isCurrentUser);
      if (!userInTop) {
        const userParticipation = await db
          .select({
            progress: globalChallengeParticipants.progress,
            rank: globalChallengeParticipants.rank,
            completed: globalChallengeParticipants.completed,
          })
          .from(globalChallengeParticipants)
          .where(and(
            eq(globalChallengeParticipants.challengeId, challengeId),
            eq(globalChallengeParticipants.userId, userId)
          ));

        if (userParticipation.length > 0) {
          const user = await db.select().from(users).where(eq(users.id, userId));
          currentUserPosition = {
            rank: userParticipation[0].rank || 0,
            name: user[0]?.name || 'You',
            avatar: user[0]?.avatarUrl || '⭐',
            progress: userParticipation[0].progress || 0,
            level: user[0]?.level || 1,
            isCurrentUser: true,
            completed: userParticipation[0].completed,
          };
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      currentUserPosition,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

function getDefaultAvatar(index: number): string {
  const avatars = ['💪', '🏃', '🎯', '⚡', '🔥', '🏋️', '🚴', '🧘', '🏊', '🎽'];
  return avatars[index % avatars.length];
}
