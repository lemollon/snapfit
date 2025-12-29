import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadFolder =
  | 'avatars'
  | 'covers'
  | 'progress-photos'
  | 'food-logs'
  | 'products'
  | 'attachments';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnailUrl?: string;
}

export interface CloudinaryConfig {
  configured: boolean;
  cloudName: string | undefined;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  [key: string]: unknown;
}

/**
 * Check if Cloudinary is properly configured
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    configured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  };
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  base64Data: string,
  folder: UploadFolder,
  options: {
    userId?: string;
    generateThumbnail?: boolean;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<UploadResult> {
  const config = getCloudinaryConfig();

  if (!config.configured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  const { userId, generateThumbnail = true, maxWidth = 2048, maxHeight = 2048 } = options;

  // Generate a unique public ID
  const timestamp = Date.now();
  const uniqueId = userId ? `${userId}_${timestamp}` : `${timestamp}`;
  const publicId = `snapfit/${folder}/${uniqueId}`;

  try {
    // Upload with transformations
    const result = await cloudinary.uploader.upload(base64Data, {
      public_id: publicId,
      folder: '', // Already included in public_id
      resource_type: 'image',
      transformation: [
        { width: maxWidth, height: maxHeight, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      // Add metadata
      context: {
        userId: userId || 'anonymous',
        folder,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate thumbnail URL if requested
    let thumbnailUrl: string | undefined;
    if (generateThumbnail) {
      thumbnailUrl = cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      thumbnailUrl,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload image to Cloudinary'
    );
  }
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  const config = getCloudinaryConfig();

  if (!config.configured) {
    throw new Error('Cloudinary is not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Generate a signed upload URL for direct client uploads
 */
export function generateSignedUploadParams(
  folder: UploadFolder,
  userId: string
): {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
} {
  const config = getCloudinaryConfig();

  if (!config.configured) {
    throw new Error('Cloudinary is not configured');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const uploadFolder = `snapfit/${folder}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder: uploadFolder,
      context: `userId=${userId}`,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: uploadFolder,
  };
}

/**
 * Test Cloudinary connection
 */
export async function testCloudinaryConnection(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  const config = getCloudinaryConfig();

  if (!config.configured) {
    return {
      success: false,
      message: 'Cloudinary is not configured',
      details: config,
    };
  }

  try {
    // Test API by fetching account details
    const result = await cloudinary.api.ping();

    return {
      success: true,
      message: 'Cloudinary connection successful',
      details: {
        status: result.status,
        cloudName: config.cloudName,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to connect to Cloudinary',
      details: { error: String(error) },
    };
  }
}

export { cloudinary };
