import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { socialShares, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Track a social share and award XP
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentType, contentId, platform, caption } = body;

    if (!contentType || !platform) {
      return NextResponse.json({ error: 'Content type and platform are required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Create share record
    const [share] = await db
      .insert(socialShares)
      .values({
        userId,
        contentType,
        contentId,
        platform,
        caption,
      })
      .returning();

    // Award XP for sharing (50 XP per share)
    const XP_REWARD = 50;
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (user.length > 0) {
      await db
        .update(users)
        .set({ xp: (user[0].xp || 0) + XP_REWARD })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      share,
      xpEarned: XP_REWARD,
      message: `Shared to ${platform}! +${XP_REWARD} XP`
    }, { status: 201 });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 });
  }
}

// GET - Get user's share stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const shares = await db
      .select()
      .from(socialShares)
      .where(eq(socialShares.userId, userId));

    const stats = {
      totalShares: shares.length,
      byPlatform: {
        instagram: shares.filter(s => s.platform === 'instagram').length,
        twitter: shares.filter(s => s.platform === 'twitter').length,
        facebook: shares.filter(s => s.platform === 'facebook').length,
        copy_link: shares.filter(s => s.platform === 'copy_link').length,
      },
      byContentType: {
        achievement: shares.filter(s => s.contentType === 'achievement').length,
        workout: shares.filter(s => s.contentType === 'workout').length,
        pr: shares.filter(s => s.contentType === 'pr').length,
        challenge: shares.filter(s => s.contentType === 'challenge').length,
      },
      totalXPEarned: shares.length * 50,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching share stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
