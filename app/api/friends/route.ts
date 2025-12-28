import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { friendships, users } from '@/lib/db/schema';
import { eq, or, and } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all friendships (accepted)
    const allFriendships = await db.query.friendships.findMany({
      where: and(
        or(eq(friendships.senderId, userId), eq(friendships.receiverId, userId)),
        eq(friendships.status, 'accepted')
      ),
    });

    // Get friend details
    const friendIds = allFriendships.map(f =>
      f.senderId === userId ? f.receiverId : f.senderId
    );

    const friends = await db.query.users.findMany({
      where: or(...friendIds.map(id => eq(users.id, id))),
      columns: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isTrainer: true,
      },
    });

    // Get pending requests (received)
    const pendingRequests = await db.query.friendships.findMany({
      where: and(eq(friendships.receiverId, userId), eq(friendships.status, 'pending')),
    });

    const pendingFromIds = pendingRequests.map(f => f.senderId);
    const pendingFrom = pendingFromIds.length > 0
      ? await db.query.users.findMany({
          where: or(...pendingFromIds.map(id => eq(users.id, id))),
          columns: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        })
      : [];

    return NextResponse.json({ friends, pendingRequests: pendingFrom });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { email } = await req.json();

    // Find user by email
    const targetUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
    }

    // Check if friendship exists
    const existing = await db.query.friendships.findFirst({
      where: or(
        and(eq(friendships.senderId, userId), eq(friendships.receiverId, targetUser.id)),
        and(eq(friendships.senderId, targetUser.id), eq(friendships.receiverId, userId))
      ),
    });

    if (existing) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
    }

    // Create friend request
    const [newFriendship] = await db.insert(friendships).values({
      senderId: userId,
      receiverId: targetUser.id,
      status: 'pending',
    }).returning();

    return NextResponse.json({ friendship: newFriendship });
  } catch (error) {
    console.error('Error creating friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
