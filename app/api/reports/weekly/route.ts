import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, workouts, foodLogs, weightLogs, progressReports } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

// GET - Get latest weekly report or generate new one
export async function GET(req: Request) {
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

    // Get latest weekly report
    const [latestReport] = await db
      .select()
      .from(progressReports)
      .where(
        and(
          eq(progressReports.userId, user.id),
          eq(progressReports.type, 'weekly')
        )
      )
      .orderBy(desc(progressReports.createdAt))
      .limit(1);

    return NextResponse.json({ report: latestReport || null });
  } catch (error) {
    console.error('Get weekly report error:', error);
    return NextResponse.json({ error: 'Failed to get report' }, { status: 500 });
  }
}

// POST - Generate new weekly AI progress report
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Gather data for the week
    const weekWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, user.id),
          gte(workouts.createdAt, startDate),
          lte(workouts.createdAt, endDate)
        )
      );

    const weekFoodLogs = await db
      .select()
      .from(foodLogs)
      .where(
        and(
          eq(foodLogs.userId, user.id),
          gte(foodLogs.loggedAt, startDate),
          lte(foodLogs.loggedAt, endDate)
        )
      );

    const weekWeightLogs = await db
      .select()
      .from(weightLogs)
      .where(
        and(
          eq(weightLogs.userId, user.id),
          gte(weightLogs.loggedAt, startDate),
          lte(weightLogs.loggedAt, endDate)
        )
      )
      .orderBy(weightLogs.loggedAt);

    // Calculate stats
    const totalWorkouts = weekWorkouts.length;
    const totalMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalMeals = weekFoodLogs.length;
    const totalCalories = weekFoodLogs.reduce((sum, f) => sum + (f.calories || 0), 0);
    const avgCaloriesPerDay = totalMeals > 0 ? Math.round(totalCalories / 7) : 0;
    const avgProtein = weekFoodLogs.length > 0
      ? Math.round(weekFoodLogs.reduce((sum, f) => sum + (f.protein || 0), 0) / weekFoodLogs.length)
      : 0;

    const startWeight = weekWeightLogs[0]?.weight;
    const endWeight = weekWeightLogs[weekWeightLogs.length - 1]?.weight;
    const weightChange = startWeight && endWeight ? endWeight - startWeight : null;

    // Prepare data summary for AI
    const dataSummary = {
      user: {
        name: user.name || 'User',
        fitnessGoal: user.fitnessGoal || 'general fitness',
        targetWeight: user.targetWeight,
        currentWeight: user.currentWeight,
        currentStreak: user.currentStreak || 0,
      },
      weekStats: {
        totalWorkouts,
        totalMinutes,
        totalMeals,
        avgCaloriesPerDay,
        avgProtein,
        weightChange,
        workoutTitles: weekWorkouts.map(w => w.title).filter(Boolean),
      },
    };

    // Generate AI report
    const client = new Anthropic({ apiKey });

    const prompt = `You are a supportive personal fitness coach analyzing a user's weekly progress. Generate an encouraging yet honest progress report.

USER DATA:
${JSON.stringify(dataSummary, null, 2)}

Generate a personalized weekly progress report with:
1. A brief congratulatory summary (2-3 sentences)
2. Key highlights from the week (3 bullet points)
3. Areas for improvement (2-3 suggestions)
4. Specific goals for next week (3 actionable items)
5. Overall performance score (0-100)

Respond in this EXACT JSON format:
{
  "summary": "Congratulatory summary here",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"],
  "improvements": ["improvement 1", "improvement 2"],
  "goals": ["goal 1", "goal 2", "goal 3"],
  "score": 75,
  "motivationalQuote": "An inspiring fitness quote"
}

Be encouraging but realistic. If data is limited, acknowledge it and encourage more tracking.
Respond ONLY with valid JSON.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = (message.content[0] as { type: 'text'; text: string }).text;
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiReport = JSON.parse(cleanedResponse);

    // Save report to database
    const [newReport] = await db
      .insert(progressReports)
      .values({
        userId: user.id,
        type: 'weekly',
        periodStart: startDate,
        periodEnd: endDate,
        summary: aiReport.summary,
        highlights: aiReport.highlights,
        workoutStats: {
          totalWorkouts,
          totalMinutes,
          workoutTitles: dataSummary.weekStats.workoutTitles,
        },
        nutritionStats: {
          totalMeals,
          avgCaloriesPerDay,
          avgProtein,
        },
        bodyStats: {
          weightChange,
          startWeight,
          endWeight,
        },
        recommendations: aiReport.improvements,
        goals: aiReport.goals,
        overallScore: aiReport.score,
      })
      .returning();

    return NextResponse.json({
      report: {
        ...newReport,
        motivationalQuote: aiReport.motivationalQuote,
      },
    });
  } catch (error) {
    console.error('Generate weekly report error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
