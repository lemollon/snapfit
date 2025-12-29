import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { progressReports } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Fetch all progress reports for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await db
      .select()
      .from(progressReports)
      .where(eq(progressReports.userId, session.user.id))
      .orderBy(desc(progressReports.periodEnd))
      .limit(20);

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
