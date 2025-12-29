import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { trainingPrograms, programWeeks, programPurchases, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch single program details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programId = params.id;

    // Get program with trainer info
    const [program] = await db
      .select({
        id: trainingPrograms.id,
        name: trainingPrograms.name,
        description: trainingPrograms.description,
        longDescription: trainingPrograms.longDescription,
        coverImageUrl: trainingPrograms.coverImageUrl,
        previewVideoUrl: trainingPrograms.previewVideoUrl,
        durationWeeks: trainingPrograms.durationWeeks,
        fitnessLevel: trainingPrograms.fitnessLevel,
        category: trainingPrograms.category,
        equipment: trainingPrograms.equipment,
        workoutsPerWeek: trainingPrograms.workoutsPerWeek,
        price: trainingPrograms.price,
        salePrice: trainingPrograms.salePrice,
        averageRating: trainingPrograms.averageRating,
        reviewCount: trainingPrograms.reviewCount,
        totalSales: trainingPrograms.totalSales,
        trainerId: trainingPrograms.trainerId,
        trainerName: users.name,
        trainerAvatar: users.avatarUrl,
      })
      .from(trainingPrograms)
      .leftJoin(users, eq(trainingPrograms.trainerId, users.id))
      .where(eq(trainingPrograms.id, programId))
      .limit(1);

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check if user has purchased
    const [purchase] = await db
      .select()
      .from(programPurchases)
      .where(
        and(
          eq(programPurchases.programId, programId),
          eq(programPurchases.userId, session.user.id)
        )
      )
      .limit(1);

    // Get program weeks if purchased
    let weeks: any[] = [];
    if (purchase) {
      weeks = await db
        .select()
        .from(programWeeks)
        .where(eq(programWeeks.programId, programId))
        .orderBy(programWeeks.weekNumber);
    }

    return NextResponse.json({
      program: {
        ...program,
        trainer: program.trainerId ? {
          id: program.trainerId,
          name: program.trainerName,
          avatarUrl: program.trainerAvatar,
        } : null,
        weeks,
      },
      purchaseInfo: purchase ? {
        isPurchased: true,
        currentWeek: purchase.currentWeek,
        completedWeeks: purchase.completedWeeks || [],
        startedAt: purchase.startedAt,
      } : {
        isPurchased: false,
      },
    });
  } catch (error) {
    console.error('Get program error:', error);
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
  }
}
