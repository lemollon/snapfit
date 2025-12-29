import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, messages, friendships, trainerClients } from '@/lib/db/schema';
import { eq, or, and, desc } from 'drizzle-orm';

// GET - Fetch conversations/messages
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get('with');

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (withUserId) {
      // Get messages with specific user
      const conversation = await db
        .select({
          id: messages.id,
          senderId: messages.senderId,
          receiverId: messages.receiverId,
          content: messages.content,
          attachmentUrl: messages.attachmentUrl,
          attachmentType: messages.attachmentType,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(
          or(
            and(
              eq(messages.senderId, user.id),
              eq(messages.receiverId, withUserId)
            ),
            and(
              eq(messages.senderId, withUserId),
              eq(messages.receiverId, user.id)
            )
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(100);

      // Mark messages from other user as read
      await db
        .update(messages)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(messages.senderId, withUserId),
            eq(messages.receiverId, user.id),
            eq(messages.isRead, false)
          )
        );

      return NextResponse.json({ messages: conversation.reverse() });
    }

    // Get list of conversations (unique users we've messaged with)
    const allMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        or(
          eq(messages.senderId, user.id),
          eq(messages.receiverId, user.id)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Get unique conversation partners
    const conversationPartners = new Map();
    for (const msg of allMessages) {
      const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      if (!conversationPartners.has(partnerId)) {
        conversationPartners.set(partnerId, {
          partnerId,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unread: msg.receiverId === user.id && !msg.isRead ? 1 : 0,
        });
      } else if (msg.receiverId === user.id && !msg.isRead) {
        const conv = conversationPartners.get(partnerId);
        conv.unread += 1;
      }
    }

    // Get partner user details
    const partnerIds = Array.from(conversationPartners.keys());
    const partners = partnerIds.length > 0 ? await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        isTrainer: users.isTrainer,
      })
      .from(users)
      .where(
        or(...partnerIds.map(id => eq(users.id, id)))
      ) : [];

    const conversations = partners.map(partner => {
      const conv = conversationPartners.get(partner.id);
      return {
        ...conv,
        partner,
      };
    }).sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content, attachmentUrl, attachmentType } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Receiver and content are required' }, { status: 400 });
    }

    const [sender] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify receiver exists
    const [receiver] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, receiverId))
      .limit(1);

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // TODO: Optionally verify sender and receiver are connected (friends or trainer-client)

    const [message] = await db
      .insert(messages)
      .values({
        senderId: sender.id,
        receiverId,
        content,
        attachmentUrl,
        attachmentType,
      })
      .returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
