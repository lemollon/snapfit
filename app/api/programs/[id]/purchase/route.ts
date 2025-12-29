import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { trainingPrograms, programPurchases } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// POST - Purchase a program
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programId = params.id;

    // Check if program exists
    const [program] = await db
      .select()
      .from(trainingPrograms)
      .where(eq(trainingPrograms.id, programId))
      .limit(1);

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check if already purchased
    const [existingPurchase] = await db
      .select()
      .from(programPurchases)
      .where(
        and(
          eq(programPurchases.programId, programId),
          eq(programPurchases.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    // Create purchase record
    const pricePaid = program.salePrice || program.price;

    const [purchase] = await db
      .insert(programPurchases)
      .values({
        programId,
        userId: session.user.id,
        trainerId: program.trainerId,
        pricePaid,
        currentWeek: 1,
        completedWeeks: [],
        status: 'active',
        startedAt: new Date(),
      })
      .returning();

    // Update program sales count
    await db
      .update(trainingPrograms)
      .set({
        totalSales: sql`COALESCE(${trainingPrograms.totalSales}, 0) + 1`,
        totalRevenue: sql`COALESCE(${trainingPrograms.totalRevenue}, 0) + ${pricePaid}`,
      })
      .where(eq(trainingPrograms.id, programId));

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        currentWeek: purchase.currentWeek,
        startedAt: purchase.startedAt,
      },
    });
  } catch (error) {
    console.error('Purchase program error:', error);
    return NextResponse.json({ error: 'Failed to purchase program' }, { status: 500 });
  }
}
