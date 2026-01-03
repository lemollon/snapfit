import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { wearableConnections, wearableData } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET - Fetch user's connected wearables and today's data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const today = new Date().toISOString().split('T')[0];

    // Get all connections
    const connections = await db
      .select()
      .from(wearableConnections)
      .where(eq(wearableConnections.userId, userId))
      .orderBy(desc(wearableConnections.isActive));

    // Get today's data
    const todayData = await db
      .select()
      .from(wearableData)
      .where(and(eq(wearableData.userId, userId), eq(wearableData.date, today)));

    return NextResponse.json({
      connections,
      todayData: todayData[0] || null,
    });
  } catch (error) {
    console.error('Error fetching wearables:', error);
    return NextResponse.json({ error: 'Failed to fetch wearables' }, { status: 500 });
  }
}

// POST - Connect a new wearable
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider, accessToken, refreshToken, deviceName, providerUserId } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if already connected
    const existing = await db
      .select()
      .from(wearableConnections)
      .where(and(eq(wearableConnections.userId, userId), eq(wearableConnections.provider, provider)));

    if (existing.length > 0) {
      // Update existing connection
      const [updated] = await db
        .update(wearableConnections)
        .set({
          accessToken,
          refreshToken,
          deviceName,
          providerUserId,
          isActive: true,
          connectionError: null,
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(wearableConnections.id, existing[0].id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new connection
      const [connection] = await db
        .insert(wearableConnections)
        .values({
          userId,
          provider,
          accessToken,
          refreshToken,
          deviceName,
          providerUserId,
          lastSyncAt: new Date(),
        })
        .returning();

      return NextResponse.json(connection, { status: 201 });
    }
  } catch (error) {
    console.error('Error connecting wearable:', error);
    return NextResponse.json({ error: 'Failed to connect wearable' }, { status: 500 });
  }
}

// DELETE - Disconnect a wearable
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Verify ownership
    const connection = await db
      .select()
      .from(wearableConnections)
      .where(and(eq(wearableConnections.id, connectionId), eq(wearableConnections.userId, userId)));

    if (connection.length === 0) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Delete connection
    await db
      .delete(wearableConnections)
      .where(eq(wearableConnections.id, connectionId));

    return NextResponse.json({ success: true, message: 'Wearable disconnected' });
  } catch (error) {
    console.error('Error disconnecting wearable:', error);
    return NextResponse.json({ error: 'Failed to disconnect wearable' }, { status: 500 });
  }
}

// PATCH - Update sync settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, syncSteps, syncHeartRate, syncSleep, syncWorkouts, syncWeight } = body;

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const [updated] = await db
      .update(wearableConnections)
      .set({
        syncSteps: syncSteps ?? undefined,
        syncHeartRate: syncHeartRate ?? undefined,
        syncSleep: syncSleep ?? undefined,
        syncWorkouts: syncWorkouts ?? undefined,
        syncWeight: syncWeight ?? undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(wearableConnections.id, connectionId), eq(wearableConnections.userId, userId)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating wearable settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
