import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  thumbnailUrl?: string;
}

/**
 * Upload an image to Cloudinary
 * @param base64Data - Base64 encoded image data (with or without data URI prefix)
 * @param folder - Folder to store the image in (e.g., 'avatars', 'progress-photos')
 * @param options - Additional upload options
 */
export async function uploadImage(
  base64Data: string,
  folder: string,
  options: {
    transformation?: object;
    generateThumbnail?: boolean;
  } = {}
): Promise<UploadResult> {
  // Ensure the base64 data has the proper prefix
  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  const uploadOptions: any = {
    folder: `snapfit/${folder}`,
    resource_type: 'image',
    ...options.transformation,
  };

  const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

  // Generate thumbnail URL if requested
  let thumbnailUrl: string | undefined;
  if (options.generateThumbnail) {
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
    thumbnailUrl,
  };
}

/**
 * Upload an avatar image with optimized settings
 */
export async function uploadAvatar(base64Data: string, userId: string): Promise<UploadResult> {
  return uploadImage(base64Data, 'avatars', {
    transformation: {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      public_id: `user-${userId}`,
      overwrite: true,
    },
    generateThumbnail: true,
  });
}

/**
 * Upload a cover photo
 */
export async function uploadCover(base64Data: string, userId: string): Promise<UploadResult> {
  return uploadImage(base64Data, 'covers', {
    transformation: {
      transformation: [
        { width: 1200, height: 400, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      public_id: `cover-${userId}`,
      overwrite: true,
    },
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
    transformation: {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
      public_id: photoId,
    },
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
    transformation: {
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      public_id: logId,
    },
    generateThumbnail: true,
  });
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export default cloudinary;
