import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { testimonials, testimonialRequests, users, trainingPrograms } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch testimonials
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'approved', 'pending', 'requests'
    const isTrainer = (session.user as any).isTrainer;

    if (isTrainer) {
      if (type === 'requests') {
        // Get pending testimonial requests
        const requests = await db.select({
          request: testimonialRequests,
          client: users,
        })
          .from(testimonialRequests)
          .leftJoin(users, eq(testimonialRequests.clientId, users.id))
          .where(and(
            eq(testimonialRequests.trainerId, session.user.id),
            eq(testimonialRequests.status, 'pending')
          ))
          .orderBy(desc(testimonialRequests.requestedAt));

        return NextResponse.json({ requests });
      }

      // Get testimonials
      const allTestimonials = await db.select({
        testimonial: testimonials,
        client: users,
        program: trainingPrograms,
      })
        .from(testimonials)
        .leftJoin(users, eq(testimonials.clientId, users.id))
        .leftJoin(trainingPrograms, eq(testimonials.programId, trainingPrograms.id))
        .where(eq(testimonials.trainerId, session.user.id))
        .orderBy(desc(testimonials.createdAt));

      const approved = allTestimonials.filter(t => t.testimonial.isApproved);
      const pending = allTestimonials.filter(t => !t.testimonial.isApproved);

      return NextResponse.json({
        testimonials: type === 'pending' ? pending : approved,
        stats: {
          total: allTestimonials.length,
          approved: approved.length,
          pending: pending.length,
          featured: allTestimonials.filter(t => t.testimonial.isFeatured).length,
        }
      });
    } else {
      // Client: Get their pending requests
      const requests = await db.select({
        request: testimonialRequests,
        trainer: users,
      })
        .from(testimonialRequests)
        .leftJoin(users, eq(testimonialRequests.trainerId, users.id))
        .where(and(
          eq(testimonialRequests.clientId, session.user.id),
          eq(testimonialRequests.status, 'pending')
        ));

      return NextResponse.json({ requests });
    }
  } catch (error) {
    console.error('Testimonials fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

// POST - Request testimonial (trainer) or submit testimonial (client)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const isTrainer = (session.user as any).isTrainer;

    if (isTrainer && body.action === 'request') {
      // Trainer requesting testimonial from client
      const { clientId, message } = body;

      const [testimonialRequest] = await db.insert(testimonialRequests).values({
        trainerId: session.user.id,
        clientId,
        message,
        status: 'pending',
      }).returning();

      return NextResponse.json({ request: testimonialRequest });
    }

    if (!isTrainer && body.action === 'submit') {
      // Client submitting testimonial
      const {
        requestId, trainerId, quote, rating, beforePhotoUrl, afterPhotoUrl,
        beforeWeight, afterWeight, transformationDuration, programId,
        category, displayName, isAnonymous
      } = body;

      const [testimonial] = await db.insert(testimonials).values({
        trainerId,
        clientId: session.user.id,
        quote,
        rating,
        beforePhotoUrl,
        afterPhotoUrl,
        beforeWeight,
        afterWeight,
        transformationDuration,
        programId,
        category,
        displayName: isAnonymous ? 'Anonymous' : displayName,
        isAnonymous,
        isApproved: false,
      }).returning();

      // Update request if provided
      if (requestId) {
        await db.update(testimonialRequests)
          .set({
            status: 'completed',
            respondedAt: new Date(),
            testimonialId: testimonial.id,
          })
          .where(eq(testimonialRequests.id, requestId));
      }

      return NextResponse.json({ testimonial });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Testimonial action error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH - Approve/feature testimonial (trainer)
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
    const { testimonialId, action } = body; // action: 'approve', 'feature', 'unfeature'

    const updates: Record<string, any> = {};
    if (action === 'approve') {
      updates.isApproved = true;
      updates.approvedAt = new Date();
    } else if (action === 'feature') {
      updates.isFeatured = true;
    } else if (action === 'unfeature') {
      updates.isFeatured = false;
    }

    const [updated] = await db.update(testimonials)
      .set(updates)
      .where(and(
        eq(testimonials.id, testimonialId),
        eq(testimonials.trainerId, session.user.id)
      ))
      .returning();

    return NextResponse.json({ testimonial: updated });
  } catch (error) {
    console.error('Testimonial update error:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE - Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const testimonialId = searchParams.get('id');

    if (!testimonialId) {
      return NextResponse.json({ error: 'Testimonial ID required' }, { status: 400 });
    }

    await db.delete(testimonials)
      .where(and(
        eq(testimonials.id, testimonialId),
        eq(testimonials.trainerId, session.user.id)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}
