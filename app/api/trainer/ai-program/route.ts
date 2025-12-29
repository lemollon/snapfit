import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiProgramDrafts, users, workoutTemplates, trainingPrograms, programWeeks } from '@/lib/db/schema';
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

// GET - Fetch AI program drafts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    if (!isTrainer) {
      return NextResponse.json({ error: 'Trainers only' }, { status: 403 });
    }

    const drafts = await db.select()
      .from(aiProgramDrafts)
      .where(eq(aiProgramDrafts.trainerId, session.user.id))
      .orderBy(desc(aiProgramDrafts.generatedAt))
      .limit(20);

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error('AI program drafts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}

// POST - Generate AI program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    if (!isTrainer) {
      return NextResponse.json({ error: 'Trainers only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId, prompt, goals, duration, daysPerWeek, equipment, restrictions,
      fitnessLevel, focusAreas
    } = body;

    // Get client profile if specified
    let clientProfile = null;
    if (clientId) {
      const [client] = await db.select()
        .from(users)
        .where(eq(users.id, clientId))
        .limit(1);

      if (client) {
        clientProfile = {
          name: client.name,
          fitnessGoal: client.fitnessGoal,
          currentWeight: client.currentWeight,
          targetWeight: client.targetWeight,
          height: client.height,
          gender: client.gender,
        };
      }
    }

    // Generate program with AI
    const systemPrompt = `You are an expert fitness coach and program designer. Create a comprehensive, periodized training program based on the given requirements.

Return a JSON object with this structure:
{
  "programName": "Descriptive program name",
  "description": "Brief program description",
  "overview": "Detailed overview of the program philosophy and approach",
  "weeks": [
    {
      "weekNumber": 1,
      "name": "Week name/phase",
      "description": "Week focus and goals",
      "workouts": [
        {
          "day": 1,
          "name": "Workout name",
          "type": "strength/cardio/hiit/mobility",
          "duration": 45,
          "warmup": [
            {"name": "Exercise", "duration": "5 min"}
          ],
          "mainWorkout": [
            {
              "name": "Exercise name",
              "sets": 3,
              "reps": "8-10",
              "rest": "60-90 sec",
              "notes": "Form cues",
              "alternatives": ["Alternative 1", "Alternative 2"]
            }
          ],
          "cooldown": [
            {"name": "Exercise", "duration": "5 min"}
          ]
        }
      ],
      "tips": "Coach tips for the week",
      "progressionNotes": "How to progress next week"
    }
  ],
  "nutritionGuidelines": "General nutrition advice for this program",
  "recoveryProtocol": "Recovery recommendations",
  "progressMetrics": ["Metrics to track"]
}`;

    const userPrompt = `Create a ${duration}-week training program with the following requirements:

${prompt ? `Additional Notes: ${prompt}` : ''}

Goals: ${goals?.join(', ') || 'General fitness'}
Training Days Per Week: ${daysPerWeek || 4}
Fitness Level: ${fitnessLevel || 'Intermediate'}
Available Equipment: ${equipment?.join(', ') || 'Full gym'}
${restrictions?.length ? `Restrictions/Injuries: ${restrictions.join(', ')}` : ''}
${focusAreas?.length ? `Focus Areas: ${focusAreas.join(', ')}` : ''}

${clientProfile ? `
Client Profile:
- Name: ${clientProfile.name}
- Goal: ${clientProfile.fitnessGoal}
- Current Weight: ${clientProfile.currentWeight}kg
- Target Weight: ${clientProfile.targetWeight}kg
- Height: ${clientProfile.height}cm
- Gender: ${clientProfile.gender}
` : ''}

Create a progressive, science-based program with proper periodization. Include exercise alternatives for each movement. Make it detailed and actionable.`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No AI response');

    const generatedProgram = JSON.parse(content);

    // Save draft
    const [draft] = await db.insert(aiProgramDrafts).values({
      trainerId: session.user.id,
      clientId,
      prompt,
      clientProfile,
      goals,
      duration,
      daysPerWeek,
      equipment,
      restrictions,
      generatedProgram,
      status: 'draft',
    }).returning();

    return NextResponse.json({
      draft,
      program: generatedProgram,
    });
  } catch (error) {
    console.error('AI program generation error:', error);
    return NextResponse.json({ error: 'Failed to generate program' }, { status: 500 });
  }
}

// PATCH - Accept/convert draft to actual program or template
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    if (!isTrainer) {
      return NextResponse.json({ error: 'Trainers only' }, { status: 403 });
    }

    const body = await request.json();
    const { draftId, action, modifications } = body; // action: 'accept_as_program', 'accept_as_template', 'reject'

    // Get draft
    const [draft] = await db.select()
      .from(aiProgramDrafts)
      .where(and(
        eq(aiProgramDrafts.id, draftId),
        eq(aiProgramDrafts.trainerId, session.user.id)
      ))
      .limit(1);

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const program = modifications || draft.generatedProgram as any;

    if (action === 'reject') {
      await db.update(aiProgramDrafts)
        .set({ status: 'rejected' })
        .where(eq(aiProgramDrafts.id, draftId));

      return NextResponse.json({ success: true });
    }

    if (action === 'accept_as_program') {
      // Create full training program
      const [newProgram] = await db.insert(trainingPrograms).values({
        trainerId: session.user.id,
        name: program.programName,
        description: program.description,
        longDescription: program.overview,
        durationWeeks: draft.duration || program.weeks?.length || 4,
        fitnessLevel: 'intermediate', // Could be inferred
        category: 'custom',
        equipment: draft.equipment,
        workoutsPerWeek: draft.daysPerWeek || 4,
        price: 0, // Draft - trainer sets price later
        status: 'draft',
      }).returning();

      // Create weeks
      if (program.weeks) {
        for (const week of program.weeks) {
          await db.insert(programWeeks).values({
            programId: newProgram.id,
            weekNumber: week.weekNumber,
            name: week.name,
            description: week.description,
            workouts: week.workouts,
            tips: week.tips,
          });
        }
      }

      // Update draft
      await db.update(aiProgramDrafts)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          resultingProgramId: newProgram.id,
        })
        .where(eq(aiProgramDrafts.id, draftId));

      return NextResponse.json({
        program: newProgram,
        message: 'Program created from AI draft'
      });
    }

    if (action === 'accept_as_template') {
      // Create workout template (simpler, just one workout)
      const firstWorkout = program.weeks?.[0]?.workouts?.[0];

      const [template] = await db.insert(workoutTemplates).values({
        trainerId: session.user.id,
        name: program.programName,
        description: program.description,
        duration: firstWorkout?.duration || 45,
        fitnessLevel: 'intermediate',
        category: firstWorkout?.type || 'strength',
        equipment: draft.equipment,
        exercises: firstWorkout ? {
          warmup: firstWorkout.warmup,
          main: firstWorkout.mainWorkout,
          cooldown: firstWorkout.cooldown,
        } : null,
      }).returning();

      // Update draft
      await db.update(aiProgramDrafts)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          resultingTemplateId: template.id,
        })
        .where(eq(aiProgramDrafts.id, draftId));

      return NextResponse.json({
        template,
        message: 'Template created from AI draft'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Draft conversion error:', error);
    return NextResponse.json({ error: 'Failed to process draft' }, { status: 500 });
  }
}
