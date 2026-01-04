import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { timerPresets } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch user's timer presets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const presets = await db
      .select()
      .from(timerPresets)
      .where(eq(timerPresets.userId, (session.user as any).id))
      .orderBy(desc(timerPresets.isFavorite), desc(timerPresets.usageCount));

    return NextResponse.json(presets);
  } catch (error) {
    console.error('Error fetching timer presets:', error);
    return NextResponse.json({ error: 'Failed to fetch presets' }, { status: 500 });
  }
}

// POST - Create new timer preset
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, rounds, workDuration, restDuration, totalDuration, intervals, color } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const [preset] = await db
      .insert(timerPresets)
      .values({
        userId: (session.user as any).id,
        name,
        type,
        rounds,
        workDuration,
        restDuration,
        totalDuration,
        intervals,
        color: color || 'violet',
      })
      .returning();

    return NextResponse.json(preset, { status: 201 });
  } catch (error) {
    console.error('Error creating timer preset:', error);
    return NextResponse.json({ error: 'Failed to create preset' }, { status: 500 });
  }
}

// PATCH - Update timer preset (e.g., toggle favorite)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isFavorite, name } = body;

    if (!id) {
      return NextResponse.json({ error: 'Preset ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof isFavorite === 'boolean') updateData.isFavorite = isFavorite;
    if (name) updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const [updated] = await db
      .update(timerPresets)
      .set(updateData)
      .where(
        and(
          eq(timerPresets.id, id),
          eq(timerPresets.userId, (session.user as any).id)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating timer preset:', error);
    return NextResponse.json({ error: 'Failed to update preset' }, { status: 500 });
  }
}
