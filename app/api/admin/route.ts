import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, workouts, foodLogs, challenges, challengeParticipants, friendships } from '@/lib/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';

// Admin emails that have access (add your email here)
const ADMIN_EMAILS = [
  'admin@snapfit.com',
  'lemollon@gmail.com', // Add your email
];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users with their stats
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        isTrainer: users.isTrainer,
        isAdmin: users.isAdmin,
        bio: users.bio,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Get workout counts per user
    const workoutCounts = await db
      .select({
        userId: workouts.userId,
        count: count(),
      })
      .from(workouts)
      .groupBy(workouts.userId);

    // Get food log counts per user
    const foodLogCounts = await db
      .select({
        userId: foodLogs.userId,
        count: count(),
      })
      .from(foodLogs)
      .groupBy(foodLogs.userId);

    // Map counts to users
    const workoutCountMap = new Map(workoutCounts.map(w => [w.userId, Number(w.count)]));
    const foodLogCountMap = new Map(foodLogCounts.map(f => [f.userId, Number(f.count)]));

    const usersWithStats = allUsers.map(user => ({
      ...user,
      workoutCount: workoutCountMap.get(user.id) || 0,
      foodLogCount: foodLogCountMap.get(user.id) || 0,
    }));

    // Get overall stats
    const totalUsers = allUsers.length;
    const totalWorkouts = workoutCounts.reduce((sum, w) => sum + Number(w.count), 0);
    const totalFoodLogs = foodLogCounts.reduce((sum, f) => sum + Number(f.count), 0);
    const trainerCount = allUsers.filter(u => u.isTrainer).length;

    // Get recent activity (last 10 workouts)
    const recentWorkouts = await db
      .select({
        id: workouts.id,
        userId: workouts.userId,
        title: workouts.title,
        duration: workouts.duration,
        createdAt: workouts.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(workouts)
      .leftJoin(users, eq(workouts.userId, users.id))
      .orderBy(desc(workouts.createdAt))
      .limit(10);

    // Get recent food logs
    const recentFoodLogs = await db
      .select({
        id: foodLogs.id,
        userId: foodLogs.userId,
        foodName: foodLogs.foodName,
        mealType: foodLogs.mealType,
        calories: foodLogs.calories,
        loggedAt: foodLogs.loggedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(foodLogs)
      .leftJoin(users, eq(foodLogs.userId, users.id))
      .orderBy(desc(foodLogs.loggedAt))
      .limit(10);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalWorkouts,
        totalFoodLogs,
        trainerCount,
      },
      users: usersWithStats,
      recentActivity: {
        workouts: recentWorkouts,
        foodLogs: recentFoodLogs,
      },
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
