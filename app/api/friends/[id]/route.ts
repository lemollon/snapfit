import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { friendships } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';

// Accept or reject friend request
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { action } = await req.json(); // 'accept' or 'reject'

    // Find the friendship where current user is the receiver
    const friendship = await db.query.friendships.findFirst({
      where: and(
        eq(friendships.senderId, params.id),
        eq(friendships.receiverId, userId),
        eq(friendships.status, 'pending')
      ),
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      await db.update(friendships)
        .set({ status: 'accepted' })
        .where(eq(friendships.id, friendship.id));
    } else {
      await db.update(friendships)
        .set({ status: 'rejected' })
        .where(eq(friendships.id, friendship.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating friendship:', error);
    return NextResponse.json({ error: 'Failed to update friendship' }, { status: 500 });
  }
}

// Remove friend
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Delete friendship in either direction
    await db.delete(friendships).where(
      or(
        and(eq(friendships.senderId, userId), eq(friendships.receiverId, params.id)),
        and(eq(friendships.senderId, params.id), eq(friendships.receiverId, userId))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}
