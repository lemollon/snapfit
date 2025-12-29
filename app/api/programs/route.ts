import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { trainingPrograms, programWeeks, programPurchases, programReviews, users, trainerEarnings } from '@/lib/db/schema';
import { eq, desc, and, gte, like, or } from 'drizzle-orm';

// GET - Browse programs or get owned programs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'browse', 'owned', 'created', 'detail'
    const programId = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (type === 'detail' && programId) {
      // Get program details
      const [program] = await db.select({
        program: trainingPrograms,
        trainer: users,
      })
        .from(trainingPrograms)
        .leftJoin(users, eq(trainingPrograms.trainerId, users.id))
        .where(eq(trainingPrograms.id, programId))
        .limit(1);

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      // Get reviews
      const reviews = await db.select({
        review: programReviews,
        user: users,
      })
        .from(programReviews)
        .leftJoin(users, eq(programReviews.userId, users.id))
        .where(eq(programReviews.programId, programId))
        .orderBy(desc(programReviews.createdAt))
        .limit(10);

      // Check if user has purchased
      let hasPurchased = false;
      let purchase = null;
      if (session?.user?.id) {
        const [existing] = await db.select()
          .from(programPurchases)
          .where(and(
            eq(programPurchases.programId, programId),
            eq(programPurchases.userId, session.user.id)
          ))
          .limit(1);
        hasPurchased = !!existing;
        purchase = existing;
      }

      // Get weeks if purchased
      let weeks = null;
      if (hasPurchased || program.program.trainerId === session?.user?.id) {
        weeks = await db.select()
          .from(programWeeks)
          .where(eq(programWeeks.programId, programId))
          .orderBy(programWeeks.weekNumber);
      }

      return NextResponse.json({
        program: program.program,
        trainer: {
          id: program.trainer?.id,
          name: program.trainer?.name,
          avatarUrl: program.trainer?.avatarUrl,
        },
        reviews,
        hasPurchased,
        purchase,
        weeks,
      });
    }

    if (type === 'owned' && session?.user?.id) {
      // Get user's purchased programs
      const purchases = await db.select({
        purchase: programPurchases,
        program: trainingPrograms,
        trainer: users,
      })
        .from(programPurchases)
        .leftJoin(trainingPrograms, eq(programPurchases.programId, trainingPrograms.id))
        .leftJoin(users, eq(programPurchases.trainerId, users.id))
        .where(eq(programPurchases.userId, session.user.id))
        .orderBy(desc(programPurchases.purchasedAt));

      return NextResponse.json({ purchases });
    }

    if (type === 'created' && session?.user?.id) {
      // Get trainer's created programs
      const programs = await db.select()
        .from(trainingPrograms)
        .where(eq(trainingPrograms.trainerId, session.user.id))
        .orderBy(desc(trainingPrograms.createdAt));

      return NextResponse.json({ programs });
    }

    // Default: Browse marketplace
    let query = db.select({
      program: trainingPrograms,
      trainer: users,
    })
      .from(trainingPrograms)
      .leftJoin(users, eq(trainingPrograms.trainerId, users.id))
      .where(eq(trainingPrograms.status, 'published'))
      .orderBy(desc(trainingPrograms.totalSales))
      .limit(50);

    const programs = await query;

    // Filter in memory for simplicity (would use proper WHERE in production)
    let filtered = programs;
    if (category) {
      filtered = filtered.filter(p => p.program.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.program.name.toLowerCase().includes(searchLower) ||
        p.program.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      programs: filtered.map(p => ({
        ...p.program,
        trainer: {
          id: p.trainer?.id,
          name: p.trainer?.name,
          avatarUrl: p.trainer?.avatarUrl,
        }
      }))
    });
  } catch (error) {
    console.error('Programs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}

// POST - Create program (trainer) or purchase program (user)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const isTrainer = (session.user as any).isTrainer;

    if (body.action === 'create' && isTrainer) {
      // Create new program
      const {
        name, description, longDescription, coverImageUrl, previewVideoUrl,
        durationWeeks, fitnessLevel, category, equipment, workoutsPerWeek,
        price, isDripContent, includesNutrition, includesCoaching, weeks
      } = body;

      const [program] = await db.insert(trainingPrograms).values({
        trainerId: session.user.id,
        name,
        description,
        longDescription,
        coverImageUrl,
        previewVideoUrl,
        durationWeeks,
        fitnessLevel,
        category,
        equipment,
        workoutsPerWeek,
        price,
        isDripContent: isDripContent ?? true,
        includesNutrition: includesNutrition ?? false,
        includesCoaching: includesCoaching ?? false,
        status: 'draft',
      }).returning();

      // Create weeks if provided
      if (weeks && weeks.length > 0) {
        for (const week of weeks) {
          await db.insert(programWeeks).values({
            programId: program.id,
            weekNumber: week.weekNumber,
            name: week.name,
            description: week.description,
            workouts: week.workouts,
            nutritionPlan: week.nutritionPlan,
            tips: week.tips,
            videoUrl: week.videoUrl,
          });
        }
      }

      return NextResponse.json({ program });
    }

    if (body.action === 'purchase') {
      // Purchase program
      const { programId, paymentMethod, paymentId } = body;

      // Get program
      const [program] = await db.select()
        .from(trainingPrograms)
        .where(eq(trainingPrograms.id, programId))
        .limit(1);

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      // Check if already purchased
      const [existing] = await db.select()
        .from(programPurchases)
        .where(and(
          eq(programPurchases.programId, programId),
          eq(programPurchases.userId, session.user.id)
        ))
        .limit(1);

      if (existing) {
        return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
      }

      // Calculate price (use sale price if active)
      const price = program.salePrice && program.saleEndsAt && new Date(program.saleEndsAt) > new Date()
        ? program.salePrice
        : program.price;

      // Create purchase
      const [purchase] = await db.insert(programPurchases).values({
        programId,
        userId: session.user.id,
        trainerId: program.trainerId,
        pricePaid: price,
        paymentMethod,
        paymentId,
        currentWeek: 1,
      }).returning();

      // Update program stats
      await db.update(trainingPrograms)
        .set({
          totalSales: (program.totalSales || 0) + 1,
          totalRevenue: (program.totalRevenue || 0) + price,
        })
        .where(eq(trainingPrograms.id, programId));

      // Record trainer earning
      const platformFee = price * 0.15; // 15% platform fee
      await db.insert(trainerEarnings).values({
        trainerId: program.trainerId,
        type: 'program_sale',
        amount: price,
        fee: platformFee,
        netAmount: price - platformFee,
        status: 'completed',
        referenceType: 'program',
        referenceId: programId,
        clientId: session.user.id,
        description: `Sale of "${program.name}"`,
      });

      return NextResponse.json({ purchase });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Program action error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH - Update program (trainer) or update progress (user)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (body.action === 'publish') {
      // Publish program
      const [updated] = await db.update(trainingPrograms)
        .set({
          status: 'published',
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(trainingPrograms.id, body.programId),
          eq(trainingPrograms.trainerId, session.user.id)
        ))
        .returning();

      return NextResponse.json({ program: updated });
    }

    if (body.action === 'progress') {
      // Update user's progress
      const { purchaseId, currentWeek, completedWeeks } = body;

      const [updated] = await db.update(programPurchases)
        .set({
          currentWeek,
          completedWeeks,
          ...(completedWeeks?.length === body.totalWeeks ? { completedAt: new Date(), status: 'completed' } : {}),
        })
        .where(and(
          eq(programPurchases.id, purchaseId),
          eq(programPurchases.userId, session.user.id)
        ))
        .returning();

      return NextResponse.json({ purchase: updated });
    }

    if (body.action === 'review') {
      // Add review
      const { programId, rating, title, review } = body;

      // Verify purchase
      const [purchase] = await db.select()
        .from(programPurchases)
        .where(and(
          eq(programPurchases.programId, programId),
          eq(programPurchases.userId, session.user.id)
        ))
        .limit(1);

      const [newReview] = await db.insert(programReviews).values({
        programId,
        userId: session.user.id,
        rating,
        title,
        review,
        isVerifiedPurchase: !!purchase,
      }).returning();

      // Update program average rating
      const allReviews = await db.select()
        .from(programReviews)
        .where(eq(programReviews.programId, programId));

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.update(trainingPrograms)
        .set({
          averageRating: avgRating,
          reviewCount: allReviews.length,
        })
        .where(eq(trainingPrograms.id, programId));

      return NextResponse.json({ review: newReview });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Program update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
