import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkInTemplates, scheduledCheckIns, checkInResponses, trainerClients, users } from '@/lib/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

// GET - Fetch check-in templates and recent responses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isTrainer = (session.user as any).isTrainer;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'templates', 'pending', 'responses'

    if (isTrainer) {
      if (type === 'templates') {
        const templates = await db.select()
          .from(checkInTemplates)
          .where(eq(checkInTemplates.trainerId, session.user.id))
          .orderBy(desc(checkInTemplates.createdAt));

        return NextResponse.json({ templates });
      }

      if (type === 'pending') {
        // Get pending check-ins for trainer to review
        const pending = await db.select({
          checkIn: scheduledCheckIns,
          response: checkInResponses,
          client: users,
        })
          .from(scheduledCheckIns)
          .leftJoin(checkInResponses, eq(scheduledCheckIns.id, checkInResponses.scheduledCheckInId))
          .leftJoin(users, eq(scheduledCheckIns.clientId, users.id))
          .where(and(
            eq(scheduledCheckIns.trainerId, session.user.id),
            eq(scheduledCheckIns.status, 'completed')
          ))
          .orderBy(desc(checkInResponses.submittedAt))
          .limit(50);

        // Filter to only unreviewed responses
        const unreviewed = pending.filter(p => p.response && !p.response.trainerReviewedAt);

        return NextResponse.json({ pending: unreviewed });
      }

      // Default: Get recent responses
      const responses = await db.select({
        response: checkInResponses,
        client: users,
      })
        .from(checkInResponses)
        .leftJoin(users, eq(checkInResponses.clientId, users.id))
        .where(eq(checkInResponses.trainerId, session.user.id))
        .orderBy(desc(checkInResponses.submittedAt))
        .limit(50);

      return NextResponse.json({ responses });
    } else {
      // Client: Get their pending check-ins
      const pending = await db.select({
        checkIn: scheduledCheckIns,
        template: checkInTemplates,
      })
        .from(scheduledCheckIns)
        .leftJoin(checkInTemplates, eq(scheduledCheckIns.templateId, checkInTemplates.id))
        .where(and(
          eq(scheduledCheckIns.clientId, session.user.id),
          eq(scheduledCheckIns.status, 'pending')
        ))
        .orderBy(scheduledCheckIns.scheduledFor);

      return NextResponse.json({ pending });
    }
  } catch (error) {
    console.error('Check-in fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }
}

// POST - Create check-in template (trainer) or submit check-in response (client)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const isTrainer = (session.user as any).isTrainer;

    if (isTrainer && body.type === 'template') {
      // Create check-in template
      const {
        name, description, frequency, dayOfWeek, dayOfMonth, timeOfDay,
        collectWeight, collectPhotos, collectMeasurements, collectMood,
        collectSleep, collectNutrition, customQuestions
      } = body;

      const [template] = await db.insert(checkInTemplates).values({
        trainerId: session.user.id,
        name,
        description,
        frequency,
        dayOfWeek,
        dayOfMonth,
        timeOfDay,
        collectWeight: collectWeight ?? true,
        collectPhotos: collectPhotos ?? true,
        collectMeasurements: collectMeasurements ?? false,
        collectMood: collectMood ?? true,
        collectSleep: collectSleep ?? true,
        collectNutrition: collectNutrition ?? false,
        customQuestions,
      }).returning();

      return NextResponse.json({ template });
    }

    if (isTrainer && body.type === 'schedule') {
      // Schedule check-ins for clients
      const { templateId, clientIds, scheduledFor } = body;

      const scheduled = [];
      for (const clientId of clientIds) {
        const [checkIn] = await db.insert(scheduledCheckIns).values({
          templateId,
          clientId,
          trainerId: session.user.id,
          scheduledFor: new Date(scheduledFor),
        }).returning();
        scheduled.push(checkIn);
      }

      return NextResponse.json({ scheduled });
    }

    if (!isTrainer && body.type === 'response') {
      // Client submitting check-in response
      const {
        scheduledCheckInId, weight, photoUrls, measurements,
        moodScore, sleepHours, sleepQuality, nutritionNotes,
        customAnswers, clientNotes
      } = body;

      // Get the scheduled check-in
      const [scheduled] = await db.select()
        .from(scheduledCheckIns)
        .where(eq(scheduledCheckIns.id, scheduledCheckInId))
        .limit(1);

      if (!scheduled || scheduled.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
      }

      // Create response
      const [response] = await db.insert(checkInResponses).values({
        scheduledCheckInId,
        clientId: session.user.id,
        trainerId: scheduled.trainerId,
        weight,
        photoUrls,
        measurements,
        moodScore,
        sleepHours,
        sleepQuality,
        nutritionNotes,
        customAnswers,
        clientNotes,
      }).returning();

      // Update scheduled check-in status
      await db.update(scheduledCheckIns)
        .set({ status: 'completed' })
        .where(eq(scheduledCheckIns.id, scheduledCheckInId));

      return NextResponse.json({ response });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Check-in creation error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}

// PATCH - Trainer reviews check-in response
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
    const { responseId, trainerNotes } = body;

    const [updated] = await db.update(checkInResponses)
      .set({
        trainerNotes,
        trainerReviewedAt: new Date(),
      })
      .where(and(
        eq(checkInResponses.id, responseId),
        eq(checkInResponses.trainerId, session.user.id)
      ))
      .returning();

    return NextResponse.json({ response: updated });
  } catch (error) {
    console.error('Check-in review error:', error);
    return NextResponse.json({ error: 'Failed to review check-in' }, { status: 500 });
  }
}

// DELETE - Delete check-in template
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    await db.delete(checkInTemplates)
      .where(and(
        eq(checkInTemplates.id, templateId),
        eq(checkInTemplates.trainerId, session.user.id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Template delete error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
