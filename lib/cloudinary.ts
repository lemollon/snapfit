import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
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
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
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
 * Check if Cloudinary is configured (simple boolean check)
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  base64Data: string,
  folder: string,
  options: {
    userId?: string;
    transformation?: object;
    generateThumbnail?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    publicId?: string;
    overwrite?: boolean;
  } = {}
): Promise<UploadResult> {
  const config = getCloudinaryConfig();

  if (!config.configured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
  }

  const { userId, generateThumbnail = false, maxWidth = 2048, maxHeight = 2048 } = options;

  // Ensure the base64 data has the proper prefix
  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  // Generate a unique public ID if not provided
  const timestamp = Date.now();
  const uniqueId = options.publicId || (userId ? `${userId}_${timestamp}` : `${timestamp}`);

  try {
    const uploadOptions: Record<string, unknown> = {
      folder: `snapfit/${folder}`,
      resource_type: 'image',
      public_id: uniqueId,
      overwrite: options.overwrite ?? false,
      transformation: options.transformation || [
        { width: maxWidth, height: maxHeight, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      context: {
        userId: userId || 'anonymous',
        folder,
        uploadedAt: new Date().toISOString(),
      },
    };

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    // Generate thumbnail URL if requested
    let thumbnailUrl: string | undefined;
    if (generateThumbnail) {
      thumbnailUrl = cloudinary.url(result.public_id, {
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
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
 * Upload an avatar image with optimized settings
 */
export async function uploadAvatar(base64Data: string, userId: string): Promise<UploadResult> {
  return uploadImage(base64Data, 'avatars', {
    userId,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    publicId: `user-${userId}`,
    overwrite: true,
    generateThumbnail: true,
  });
}

/**
 * Upload a cover photo
 */
export async function uploadCover(base64Data: string, userId: string): Promise<UploadResult> {
  return uploadImage(base64Data, 'covers', {
    userId,
    transformation: [
      { width: 1200, height: 400, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    publicId: `cover-${userId}`,
    overwrite: true,
  });
}

/**
 * Upload a progress photo
 */
export async function uploadProgressPhoto(
  base64Data: string,
  userId: string,
  photoId: string
): Promise<UploadResult> {
  return uploadImage(base64Data, `progress/${userId}`, {
    userId,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
    publicId: photoId,
    generateThumbnail: true,
  });
}

/**
 * Upload a food photo
 */
export async function uploadFoodPhoto(
  base64Data: string,
  userId: string,
  logId: string
): Promise<UploadResult> {
  return uploadImage(base64Data, `food/${userId}`, {
    userId,
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
    publicId: logId,
    generateThumbnail: true,
  });
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
export default cloudinary;
