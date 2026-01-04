import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadVideo, isCloudinaryConfigured } from '@/lib/cloudinary';

export const maxDuration = 120; // Allow up to 120 seconds for video uploads

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos

/**
 * POST /api/upload/video
 * Upload a video to Cloudinary
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

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: 'Video upload is not configured. Please set up Cloudinary credentials.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { video, folder = 'form-checks' } = body;

    // Validate required fields
    if (!video) {
      return NextResponse.json(
        { error: 'Video data is required' },
        { status: 400 }
      );
    }

    // Validate video format (must be base64 data URL)
    if (!video.startsWith('data:video/')) {
      return NextResponse.json(
        { error: 'Invalid video format. Must be a base64 data URL starting with "data:video/"' },
        { status: 400 }
      );
    }

    // Check file size (rough estimate from base64)
    const base64Length = video.length - (video.indexOf(',') + 1);
    const estimatedSize = (base64Length * 3) / 4;

    if (estimatedSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Video too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const result = await uploadVideo(video, folder, {
      userId: session.user.id,
      generateThumbnail: true,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload video' },
      { status: 500 }
    );
  }
}
