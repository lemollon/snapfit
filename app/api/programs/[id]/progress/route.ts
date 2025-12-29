import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { programPurchases } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// PATCH - Update program progress
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const programId = params.id;
    const body = await req.json();
    const { currentWeek, completeWeek } = body;

    // Get existing purchase
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

    if (!purchase) {
      return NextResponse.json({ error: 'Not purchased' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (currentWeek !== undefined) {
      updateData.currentWeek = currentWeek;
    }

    if (completeWeek !== undefined) {
      const completedWeeks = purchase.completedWeeks || [];
      if (!completedWeeks.includes(completeWeek)) {
        updateData.completedWeeks = [...completedWeeks, completeWeek];
      }
    }

    const [updated] = await db
      .update(programPurchases)
      .set(updateData)
      .where(eq(programPurchases.id, purchase.id))
      .returning();

    return NextResponse.json({
      success: true,
      currentWeek: updated.currentWeek,
      completedWeeks: updated.completedWeeks,
    });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
