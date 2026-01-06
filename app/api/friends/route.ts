import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { friendships, users } from '@/lib/db/schema';
import { eq, or, and, inArray } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get all friendships (accepted) using select API
    const allFriendships = await db.select().from(friendships)
      .where(and(
        or(eq(friendships.senderId, userId), eq(friendships.receiverId, userId)),
        eq(friendships.status, 'accepted')
      ));

    // Get friend details
    const friendIds = allFriendships.map(f =>
      f.senderId === userId ? f.receiverId : f.senderId
    );

    // Handle empty array case
    const friends = friendIds.length > 0
      ? await db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
          isTrainer: users.isTrainer,
        }).from(users).where(inArray(users.id, friendIds))
      : [];

    // Get pending requests (received) using select API
    const pendingRequests = await db.select().from(friendships)
      .where(and(eq(friendships.receiverId, userId), eq(friendships.status, 'pending')));

    const pendingFromIds = pendingRequests.map(f => f.senderId);
    const pendingFrom = pendingFromIds.length > 0
      ? await db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        }).from(users).where(inArray(users.id, pendingFromIds))
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

    // Find user by email using select API
    const [targetUser] = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
    }

    // Check if friendship exists using select API
    const [existing] = await db.select().from(friendships)
      .where(or(
        and(eq(friendships.senderId, userId), eq(friendships.receiverId, targetUser.id)),
        and(eq(friendships.senderId, targetUser.id), eq(friendships.receiverId, userId))
      ))
      .limit(1);

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
