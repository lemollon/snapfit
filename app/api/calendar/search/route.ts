import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  workouts, foodLogs, progressPhotos, formChecks, scheduledWorkouts
} from '@/lib/db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';

// GET - Search across all user data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, meals, workouts, photos, form-checks
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        message: 'Search query must be at least 2 characters'
      });
    }

    const results: any[] = [];

    // Search workouts
    if (type === 'all' || type === 'workouts') {
      const workoutResults = await db.select()
        .from(workouts)
        .where(and(
          eq(workouts.userId, userId),
          or(
            ilike(workouts.title, `%${query}%`),
            ilike(workouts.notes, `%${query}%`)
          )
        ))
        .orderBy(desc(workouts.createdAt))
        .limit(type === 'all' ? 10 : limit);

      workoutResults.forEach(w => {
        results.push({
          id: w.id,
          type: 'workout',
          title: w.title || 'Workout',
          subtitle: w.duration ? `${w.duration} min` : null,
          timestamp: w.createdAt,
          matchedField: 'title',
        });
      });

      // Also search scheduled workouts
      const scheduledResults = await db.select()
        .from(scheduledWorkouts)
        .where(and(
          eq(scheduledWorkouts.userId, userId),
          or(
            ilike(scheduledWorkouts.title, `%${query}%`),
            ilike(scheduledWorkouts.description, `%${query}%`)
          )
        ))
        .orderBy(desc(scheduledWorkouts.scheduledFor))
        .limit(type === 'all' ? 10 : limit);

      scheduledResults.forEach(s => {
        results.push({
          id: s.id,
          type: 'scheduled_workout',
          title: s.title,
          subtitle: s.status,
          timestamp: s.scheduledFor,
          matchedField: 'title',
        });
      });
    }

    // Search meals
    if (type === 'all' || type === 'meals') {
      const mealResults = await db.select()
        .from(foodLogs)
        .where(and(
          eq(foodLogs.userId, userId),
          or(
            ilike(foodLogs.foodName, `%${query}%`),
            ilike(foodLogs.notes, `%${query}%`)
          )
        ))
        .orderBy(desc(foodLogs.loggedAt))
        .limit(type === 'all' ? 10 : limit);

      mealResults.forEach(m => {
        results.push({
          id: m.id,
          type: 'meal',
          title: m.foodName || `${m.mealType} meal`,
          subtitle: m.calories ? `${m.calories} kcal` : null,
          timestamp: m.loggedAt,
          mealType: m.mealType,
          photoUrl: m.photoUrl,
          matchedField: 'foodName',
        });
      });
    }

    // Search photos by notes
    if (type === 'all' || type === 'photos') {
      const photoResults = await db.select()
        .from(progressPhotos)
        .where(and(
          eq(progressPhotos.userId, userId),
          ilike(progressPhotos.notes, `%${query}%`)
        ))
        .orderBy(desc(progressPhotos.takenAt))
        .limit(type === 'all' ? 10 : limit);

      photoResults.forEach(p => {
        results.push({
          id: p.id,
          type: 'photo',
          title: `Progress Photo (${p.type})`,
          subtitle: p.notes?.substring(0, 50),
          timestamp: p.takenAt,
          photoUrl: p.photoUrl,
          thumbnailUrl: p.thumbnailUrl,
          matchedField: 'notes',
        });
      });
    }

    // Search form checks
    if (type === 'all' || type === 'form-checks') {
      const formCheckResults = await db.select()
        .from(formChecks)
        .where(and(
          eq(formChecks.userId, userId),
          ilike(formChecks.exerciseName, `%${query}%`)
        ))
        .orderBy(desc(formChecks.createdAt))
        .limit(type === 'all' ? 10 : limit);

      formCheckResults.forEach(f => {
        results.push({
          id: f.id,
          type: 'form-check',
          title: f.exerciseName,
          subtitle: f.aiScore ? `Score: ${f.aiScore}/100` : f.status,
          timestamp: f.createdAt,
          thumbnailUrl: f.thumbnailUrl,
          matchedField: 'exerciseName',
        });
      });
    }

    // Sort all results by timestamp
    results.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      query,
      type,
      results: results.slice(0, limit),
      totalResults: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
