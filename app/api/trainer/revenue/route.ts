import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { trainerEarnings, revenueSnapshots, trainerClients, programPurchases, trainingPrograms } from '@/lib/db/schema';
import { eq, desc, and, gte, lte, sql, sum } from 'drizzle-orm';

// GET - Fetch revenue dashboard data
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const now = new Date();
    const startDate = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Get recent earnings
    const earnings = await db.select()
      .from(trainerEarnings)
      .where(and(
        eq(trainerEarnings.trainerId, session.user.id),
        gte(trainerEarnings.createdAt, startDate)
      ))
      .orderBy(desc(trainerEarnings.createdAt));

    // Calculate totals
    const totalRevenue = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalFees = earnings.reduce((sum, e) => sum + (e.fee || 0), 0);
    const netRevenue = earnings.reduce((sum, e) => sum + e.netAmount, 0);

    // Group by type
    const revenueByType = earnings.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // Get total clients
    const clients = await db.select()
      .from(trainerClients)
      .where(and(
        eq(trainerClients.trainerId, session.user.id),
        eq(trainerClients.status, 'active')
      ));

    // Get program sales
    const programSales = await db.select()
      .from(programPurchases)
      .where(and(
        eq(programPurchases.trainerId, session.user.id),
        gte(programPurchases.purchasedAt, startDate)
      ));

    // Daily revenue for chart
    const dailyRevenue: Record<string, number> = {};
    earnings.forEach(e => {
      if (e.createdAt) {
        const date = new Date(e.createdAt).toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + e.netAmount;
      }
    });

    // Convert to array for chart
    const chartData = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        revenue: dailyRevenue[dateStr] || 0,
      });
    }

    // Get historical snapshots
    const snapshots = await db.select()
      .from(revenueSnapshots)
      .where(eq(revenueSnapshots.trainerId, session.user.id))
      .orderBy(desc(revenueSnapshots.month))
      .limit(12);

    // Top selling programs
    const topPrograms = await db.select({
      program: trainingPrograms,
    })
      .from(trainingPrograms)
      .where(eq(trainingPrograms.trainerId, session.user.id))
      .orderBy(desc(trainingPrograms.totalRevenue))
      .limit(5);

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalFees,
        netRevenue,
        transactionCount: earnings.length,
        averageOrderValue: earnings.length > 0 ? totalRevenue / earnings.length : 0,
        totalClients: clients.length,
        programsSold: programSales.length,
      },
      revenueByType,
      chartData,
      recentTransactions: earnings.slice(0, 20),
      snapshots,
      topPrograms: topPrograms.map(p => p.program),
    });
  } catch (error) {
    console.error('Revenue fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
  }
}

// POST - Create monthly snapshot (usually called by cron job)
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
    const monthDate = body.month ? new Date(body.month) : new Date();
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    // Get earnings for the month
    const earnings = await db.select()
      .from(trainerEarnings)
      .where(and(
        eq(trainerEarnings.trainerId, session.user.id),
        gte(trainerEarnings.createdAt, monthStart),
        lte(trainerEarnings.createdAt, monthEnd)
      ));

    // Calculate metrics
    const totalRevenue = earnings.filter(e => e.type !== 'refund').reduce((sum, e) => sum + e.amount, 0);
    const programRevenue = earnings.filter(e => e.type === 'program_sale').reduce((sum, e) => sum + e.amount, 0);
    const refunds = earnings.filter(e => e.type === 'refund').reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const netRevenue = earnings.reduce((sum, e) => sum + e.netAmount, 0);

    // Get client counts
    const activeClients = await db.select()
      .from(trainerClients)
      .where(and(
        eq(trainerClients.trainerId, session.user.id),
        eq(trainerClients.status, 'active')
      ));

    const newClients = await db.select()
      .from(trainerClients)
      .where(and(
        eq(trainerClients.trainerId, session.user.id),
        gte(trainerClients.createdAt, monthStart),
        lte(trainerClients.createdAt, monthEnd)
      ));

    // Program sales
    const programsSold = await db.select()
      .from(programPurchases)
      .where(and(
        eq(programPurchases.trainerId, session.user.id),
        gte(programPurchases.purchasedAt, monthStart),
        lte(programPurchases.purchasedAt, monthEnd)
      ));

    // Upsert snapshot
    const monthKey = monthStart.toISOString().split('T')[0];
    const existing = await db.select()
      .from(revenueSnapshots)
      .where(and(
        eq(revenueSnapshots.trainerId, session.user.id),
        eq(revenueSnapshots.month, monthKey)
      ))
      .limit(1);

    const snapshotData = {
      trainerId: session.user.id,
      month: monthKey,
      totalRevenue,
      programRevenue,
      subscriptionRevenue: 0, // Future feature
      otherRevenue: totalRevenue - programRevenue,
      refunds,
      netRevenue,
      totalClients: activeClients.length,
      newClients: newClients.length,
      churnedClients: 0, // TODO: Calculate
      programsSold: programsSold.length,
      averageOrderValue: programsSold.length > 0
        ? programsSold.reduce((sum, p) => sum + p.pricePaid, 0) / programsSold.length
        : 0,
    };

    let snapshot;
    if (existing.length > 0) {
      [snapshot] = await db.update(revenueSnapshots)
        .set(snapshotData)
        .where(eq(revenueSnapshots.id, existing[0].id))
        .returning();
    } else {
      [snapshot] = await db.insert(revenueSnapshots)
        .values(snapshotData)
        .returning();
    }

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Snapshot creation error:', error);
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
  }
}
