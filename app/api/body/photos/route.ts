import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, progressPhotos, weightLogs } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch progress photos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // front, side, back
    const limit = parseInt(searchParams.get('limit') || '50');

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, user.id))
      .orderBy(desc(progressPhotos.takenAt))
      .limit(limit);

    if (type) {
      query = db
        .select()
        .from(progressPhotos)
        .where(
          and(
            eq(progressPhotos.userId, user.id),
            eq(progressPhotos.type, type)
          )
        )
        .orderBy(desc(progressPhotos.takenAt))
        .limit(limit);
    }

    const photos = await query;

    // Group by type for easier display
    const groupedPhotos = {
      front: photos.filter(p => p.type === 'front'),
      side: photos.filter(p => p.type === 'side'),
      back: photos.filter(p => p.type === 'back'),
      all: photos,
    };

    return NextResponse.json({
      photos: groupedPhotos,
      totalCount: photos.length,
    });
  } catch (error) {
    console.error('Get progress photos error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

// POST - Upload new progress photo
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { photoUrl, thumbnailUrl, type, weight, notes, isPublic } = body;

    if (!photoUrl) {
      return NextResponse.json({ error: 'Photo URL is required' }, { status: 400 });
    }

    if (!type || !['front', 'side', 'back'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (front, side, back) is required' }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id, currentWeight: users.currentWeight })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use provided weight or get current weight from user profile
    const photoWeight = weight || user.currentWeight;

    const [newPhoto] = await db
      .insert(progressPhotos)
      .values({
        userId: user.id,
        photoUrl,
        thumbnailUrl,
        type,
        weight: photoWeight,
        notes,
        isPublic: isPublic || false,
      })
      .returning();

    return NextResponse.json({ photo: newPhoto });
  } catch (error) {
    console.error('Upload progress photo error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

// DELETE - Remove a progress photo
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify photo belongs to user before deleting
    await db
      .delete(progressPhotos)
      .where(
        and(
          eq(progressPhotos.id, photoId),
          eq(progressPhotos.userId, user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete progress photo error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
