import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, achievements, userAchievements, xpTransactions } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch all achievements and user's progress
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select({ id: users.id, xp: users.xp, level: users.level })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all achievements
    const allAchievements = await db
      .select()
      .from(achievements)
      .orderBy(achievements.category, achievements.rarity);

    // Get user's achievement progress
    const userProgress = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));

    // Create a map of user progress
    const progressMap = new Map(
      userProgress.map(up => [up.achievementId, up])
    );

    // Combine achievements with user progress
    const achievementsWithProgress = allAchievements.map(achievement => {
      const progress = progressMap.get(achievement.id);
      return {
        ...achievement,
        userProgress: progress?.progress || 0,
        isComplete: progress?.isComplete || false,
        earnedAt: progress?.earnedAt || null,
      };
    });

    // Separate into categories
    const grouped = {
      workout: achievementsWithProgress.filter(a => a.category === 'workout'),
      nutrition: achievementsWithProgress.filter(a => a.category === 'nutrition'),
      streak: achievementsWithProgress.filter(a => a.category === 'streak'),
      social: achievementsWithProgress.filter(a => a.category === 'social'),
      milestone: achievementsWithProgress.filter(a => a.category === 'milestone'),
    };

    // Calculate level info
    const xp = user.xp || 0;
    const level = user.level || 1;
    const xpForNextLevel = level * 500; // Each level requires level * 500 XP
    const xpProgress = xp % xpForNextLevel;
    const xpPercentage = Math.round((xpProgress / xpForNextLevel) * 100);

    return NextResponse.json({
      achievements: achievementsWithProgress,
      grouped,
      stats: {
        totalAchievements: allAchievements.length,
        earnedCount: userProgress.filter(up => up.isComplete).length,
        xp,
        level,
        xpForNextLevel,
        xpProgress,
        xpPercentage,
      },
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
