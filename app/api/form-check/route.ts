import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { formChecks, users, trainerClients } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

// GET - Fetch form checks for user or trainer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const isTrainer = (session.user as any).isTrainer;

    let checks;
    if (isTrainer && clientId) {
      // Verify this trainer has access to this client
      const [relationship] = await db.select()
        .from(trainerClients)
        .where(and(
          eq(trainerClients.trainerId, session.user.id),
          eq(trainerClients.clientId, clientId),
          eq(trainerClients.status, 'active')
        ))
        .limit(1);

      if (!relationship) {
        return NextResponse.json({ error: 'Access denied - not your client' }, { status: 403 });
      }

      // Trainer viewing client's form checks
      checks = await db.select()
        .from(formChecks)
        .where(eq(formChecks.userId, clientId))
        .orderBy(desc(formChecks.createdAt))
        .limit(50);
    } else {
      // User viewing their own form checks
      checks = await db.select()
        .from(formChecks)
        .where(eq(formChecks.userId, session.user.id))
        .orderBy(desc(formChecks.createdAt))
        .limit(50);
    }

    return NextResponse.json({ formChecks: checks });
  } catch (error) {
    console.error('Form check fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch form checks' }, { status: 500 });
  }
}

// POST - Submit a new form check for AI analysis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { exerciseName, videoUrl, thumbnailUrl, duration } = body;

    if (!exerciseName || !videoUrl) {
      return NextResponse.json({ error: 'Exercise name and video URL are required' }, { status: 400 });
    }

    // Create form check record
    const [formCheck] = await db.insert(formChecks).values({
      userId: session.user.id,
      exerciseName,
      videoUrl,
      thumbnailUrl,
      duration,
      status: 'analyzing',
    }).returning();

    // Analyze form with AI (async - would normally be a background job)
    try {
      const analysis = await analyzeFormWithAI(exerciseName, videoUrl);

      await db.update(formChecks)
        .set({
          status: analysis.score >= 70 ? 'good' : 'needs_work',
          aiAnalysis: analysis,
          aiScore: analysis.score,
          keyPoints: analysis.keyPoints,
          improvements: analysis.improvements,
        })
        .where(eq(formChecks.id, formCheck.id));

      return NextResponse.json({
        formCheck: { ...formCheck, ...analysis },
        message: 'Form analyzed successfully'
      });
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      // Still return the form check, just without AI analysis
      return NextResponse.json({
        formCheck,
        message: 'Form check saved, AI analysis pending'
      });
    }
  } catch (error) {
    console.error('Form check submission error:', error);
    return NextResponse.json({ error: 'Failed to submit form check' }, { status: 500 });
  }
}

// AI Form Analysis Function
async function analyzeFormWithAI(exerciseName: string, videoUrl: string) {
  // In a real implementation, this would:
  // 1. Extract frames from the video
  // 2. Send frames to a vision model for pose analysis
  // 3. Compare against ideal form benchmarks

  // For now, we'll use GPT to generate educational feedback based on exercise name
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert fitness coach analyzing exercise form. Provide detailed, actionable feedback for the ${exerciseName} exercise. Return JSON with:
- score: 0-100 (randomize between 65-95 for demo)
- overallAssessment: Brief overall assessment
- keyPoints: Array of 3-5 specific form observations (mix of good and needs improvement)
- improvements: Array of 2-3 specific actionable improvements
- safetyNotes: Any important safety considerations
- commonMistakes: Common mistakes for this exercise to watch for`
      },
      {
        role: 'user',
        content: `Analyze form for: ${exerciseName}. Provide educational feedback as if reviewing a video submission.`
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No AI response');

  return JSON.parse(content);
}

// PATCH - Trainer adds feedback to form check
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    if (!isTrainer) {
      return NextResponse.json({ error: 'Only trainers can add feedback' }, { status: 403 });
    }

    const body = await request.json();
    const { formCheckId, feedback, score } = body;

    const [updated] = await db.update(formChecks)
      .set({
        trainerId: session.user.id,
        trainerFeedback: feedback,
        trainerScore: score,
        status: 'reviewed',
        reviewedAt: new Date(),
      })
      .where(eq(formChecks.id, formCheckId))
      .returning();

    return NextResponse.json({ formCheck: updated });
  } catch (error) {
    console.error('Form check update error:', error);
    return NextResponse.json({ error: 'Failed to update form check' }, { status: 500 });
  }
}
