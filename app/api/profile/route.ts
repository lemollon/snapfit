import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, workouts, foodLogs, weightLogs, progressPhotos, userAchievements, achievements } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';

// GET - Fetch current user's profile with stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get workout count
    const [workoutStats] = await db
      .select({ count: count() })
      .from(workouts)
      .where(eq(workouts.userId, user.id));

    // Get food log count
    const [foodStats] = await db
      .select({ count: count() })
      .from(foodLogs)
      .where(eq(foodLogs.userId, user.id));

    // Get recent weight logs
    const recentWeightLogs = await db
      .select()
      .from(weightLogs)
      .where(eq(weightLogs.userId, user.id))
      .orderBy(desc(weightLogs.loggedAt))
      .limit(5);

    // Get recent progress photos
    const recentPhotos = await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, user.id))
      .orderBy(desc(progressPhotos.takenAt))
      .limit(6);

    // Get earned achievements
    const earnedAchievements = await db
      .select({
        id: userAchievements.id,
        earnedAt: userAchievements.earnedAt,
        name: achievements.name,
        description: achievements.description,
        iconEmoji: achievements.iconEmoji,
        rarity: achievements.rarity,
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, user.id))
      .orderBy(desc(userAchievements.earnedAt))
      .limit(10);

    // Calculate age from DOB
    let age = null;
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
    }

    // Remove sensitive data
    const { password, ...safeUser } = user;

    return NextResponse.json({
      user: {
        ...safeUser,
        age,
      },
      stats: {
        totalWorkouts: workoutStats?.count || 0,
        totalFoodLogs: foodStats?.count || 0,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        totalMinutes: user.totalMinutes || 0,
        xp: user.xp || 0,
        level: user.level || 1,
      },
      recentWeightLogs,
      recentPhotos,
      earnedAchievements,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH - Update user profile
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      avatarUrl,
      coverUrl,
      instagramUrl,
      tiktokUrl,
      youtubeUrl,
      twitterUrl,
      websiteUrl,
      fitnessGoal,
      targetWeight,
      currentWeight,
      height,
      dateOfBirth,
      gender,
      // Trainer specific
      certifications,
      specializations,
      hourlyRate,
      // Trainer store links
      shopUrl,
      amazonStorefront,
      supplementStoreUrl,
      apparelStoreUrl,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (tiktokUrl !== undefined) updateData.tiktokUrl = tiktokUrl;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (fitnessGoal !== undefined) updateData.fitnessGoal = fitnessGoal;
    if (targetWeight !== undefined) updateData.targetWeight = targetWeight;
    if (currentWeight !== undefined) updateData.currentWeight = currentWeight;
    if (height !== undefined) updateData.height = height;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (shopUrl !== undefined) updateData.shopUrl = shopUrl;
    if (amazonStorefront !== undefined) updateData.amazonStorefront = amazonStorefront;
    if (supplementStoreUrl !== undefined) updateData.supplementStoreUrl = supplementStoreUrl;
    if (apparelStoreUrl !== undefined) updateData.apparelStoreUrl = apparelStoreUrl;

    updateData.updatedAt = new Date();

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.email, session.user.email))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...safeUser } = updated;

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
