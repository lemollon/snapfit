import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage, deleteImage, type UploadFolder } from '@/lib/cloudinary';

export const maxDuration = 60; // Allow up to 60 seconds for large uploads

const VALID_FOLDERS: UploadFolder[] = [
  'avatars',
  'covers',
  'progress-photos',
  'food-logs',
  'products',
  'attachments',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/upload
 * Upload an image to Cloudinary
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { image, folder, generateThumbnail = true } = body;

    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    if (!folder || !VALID_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json(
        { error: `Invalid folder. Must be one of: ${VALID_FOLDERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate image format (must be base64 data URL)
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be a base64 data URL starting with "data:image/"' },
        { status: 400 }
      );
    }

    // Check file size (rough estimate from base64)
    const base64Length = image.length - (image.indexOf(',') + 1);
    const estimatedSize = (base64Length * 3) / 4;

    if (estimatedSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Image too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadImage(image, folder as UploadFolder, {
      userId: session.user.id,
      generateThumbnail,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload image',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload
 * Delete an image from Cloudinary
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId is required' },
        { status: 400 }
      );
    }

    // Verify the publicId belongs to the user (basic check)
    if (!publicId.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this image' },
        { status: 403 }
      );
    }

    const success = await deleteImage(publicId);

    return NextResponse.json({
      success,
      message: success ? 'Image deleted' : 'Failed to delete image',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete image',
        success: false,
      },
      { status: 500 }
    );
  }
}
