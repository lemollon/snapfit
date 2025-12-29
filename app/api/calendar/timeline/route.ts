import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  workouts, foodLogs, progressPhotos, dailyLogs, formChecks,
  scheduledWorkouts
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, or, ilike, sql } from 'drizzle-orm';

// GET - Fetch timeline data (all activities in chronological order)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const filter = searchParams.get('filter') || 'all'; // all, meals, workouts, photos, form-checks
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Default to last 30 days if no dates specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 59, 999);

    const timelineItems: any[] = [];

    // Fetch workouts
    if (filter === 'all' || filter === 'workouts') {
      const workoutData = await db.select()
        .from(workouts)
        .where(and(
          eq(workouts.userId, userId),
          gte(workouts.createdAt, start),
          lte(workouts.createdAt, end),
          search ? ilike(workouts.title, `%${search}%`) : undefined
        ))
        .orderBy(desc(workouts.createdAt));

      workoutData.forEach(w => {
        timelineItems.push({
          id: w.id,
          type: 'workout',
          title: w.title || 'Workout',
          description: w.notes || null,
          timestamp: w.createdAt,
          duration: w.duration,
          calories: undefined,
          icon: 'dumbbell',
          color: 'blue',
        });
      });

      // Also get scheduled workouts
      const scheduledData = await db.select()
        .from(scheduledWorkouts)
        .where(and(
          eq(scheduledWorkouts.userId, userId),
          gte(scheduledWorkouts.scheduledFor, start),
          lte(scheduledWorkouts.scheduledFor, end),
          search ? ilike(scheduledWorkouts.title, `%${search}%`) : undefined
        ))
        .orderBy(desc(scheduledWorkouts.scheduledFor));

      scheduledData.forEach(s => {
        timelineItems.push({
          id: s.id,
          type: 'scheduled_workout',
          title: s.title,
          description: s.description,
          timestamp: s.scheduledFor,
          duration: s.duration,
          status: s.status,
          icon: 'calendar',
          color: s.status === 'completed' ? 'green' : s.status === 'skipped' ? 'red' : 'indigo',
        });
      });
    }

    // Fetch meals/food logs
    if (filter === 'all' || filter === 'meals') {
      const mealData = await db.select()
        .from(foodLogs)
        .where(and(
          eq(foodLogs.userId, userId),
          gte(foodLogs.loggedAt, start),
          lte(foodLogs.loggedAt, end),
          search ? ilike(foodLogs.foodName, `%${search}%`) : undefined
        ))
        .orderBy(desc(foodLogs.loggedAt));

      mealData.forEach(m => {
        timelineItems.push({
          id: m.id,
          type: 'meal',
          title: m.foodName || `${m.mealType} meal`,
          mealType: m.mealType,
          timestamp: m.loggedAt,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          photoUrl: m.photoUrl,
          icon: 'utensils',
          color: 'green',
        });
      });
    }

    // Fetch progress photos
    if (filter === 'all' || filter === 'photos') {
      const photoData = await db.select()
        .from(progressPhotos)
        .where(and(
          eq(progressPhotos.userId, userId),
          gte(progressPhotos.takenAt, start),
          lte(progressPhotos.takenAt, end),
          search ? ilike(progressPhotos.notes, `%${search}%`) : undefined
        ))
        .orderBy(desc(progressPhotos.takenAt));

      photoData.forEach(p => {
        timelineItems.push({
          id: p.id,
          type: 'photo',
          title: `Progress Photo (${p.type})`,
          photoType: p.type,
          timestamp: p.takenAt,
          photoUrl: p.photoUrl,
          thumbnailUrl: p.thumbnailUrl,
          weight: p.weight,
          notes: p.notes,
          icon: 'camera',
          color: 'purple',
        });
      });
    }

    // Fetch form checks
    if (filter === 'all' || filter === 'form-checks') {
      const formCheckData = await db.select()
        .from(formChecks)
        .where(and(
          eq(formChecks.userId, userId),
          gte(formChecks.createdAt, start),
          lte(formChecks.createdAt, end),
          search ? ilike(formChecks.exerciseName, `%${search}%`) : undefined
        ))
        .orderBy(desc(formChecks.createdAt));

      formCheckData.forEach(f => {
        timelineItems.push({
          id: f.id,
          type: 'form-check',
          title: `Form Check: ${f.exerciseName}`,
          exerciseName: f.exerciseName,
          timestamp: f.createdAt,
          videoUrl: f.videoUrl,
          thumbnailUrl: f.thumbnailUrl,
          aiScore: f.aiScore,
          status: f.status,
          icon: 'video',
          color: 'pink',
        });
      });
    }

    // Fetch daily logs
    if (filter === 'all') {
      const dailyData = await db.select()
        .from(dailyLogs)
        .where(and(
          eq(dailyLogs.userId, userId),
          gte(dailyLogs.date, start.toISOString().split('T')[0]),
          lte(dailyLogs.date, end.toISOString().split('T')[0])
        ))
        .orderBy(desc(dailyLogs.date));

      dailyData.forEach(d => {
        timelineItems.push({
          id: d.id,
          type: 'daily-log',
          title: 'Daily Check-in',
          timestamp: new Date(d.date + 'T12:00:00'),
          weight: d.weight,
          mood: d.mood,
          energyLevel: d.energyLevel,
          sleepHours: d.sleepHours,
          waterIntake: d.waterIntake,
          notes: d.notes,
          icon: 'clipboard',
          color: 'amber',
        });
      });
    }

    // Sort by timestamp descending
    timelineItems.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const paginatedItems = timelineItems.slice(offset, offset + limit);
    const totalItems = timelineItems.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Group by date for display
    const groupedByDate: Record<string, any[]> = {};
    paginatedItems.forEach(item => {
      const dateKey = new Date(item.timestamp).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(item);
    });

    return NextResponse.json({
      items: paginatedItems,
      groupedByDate,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Timeline error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}
