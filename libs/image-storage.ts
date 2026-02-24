import { supabase, supabaseServiceRole } from './supabase-client';

// Helper function to detect if we're in a server environment
function isServerEnvironment(): boolean {
  return typeof window === 'undefined';
}

// Configuration constants
export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
  ],
  BUCKET_NAME: 'product-images',
} as const;

export interface ImageValidationError {
  field: string;
  message: string;
}

export interface UploadedImageInfo {
  url: string;
  path: string;
  name: string;
  size: number;
  mimeType: string;
}

/**
 * Validate image file type and size
 * @param file - The file to validate
 * @returns null if valid, or an error object with validation details
 */
export function validateImageFile(file: File): ImageValidationError | null {
  // Check if file is provided
  if (!file) {
    return {
      field: 'image',
      message: 'No file provided',
    };
  }

  // Check file type
  if (!IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      field: 'image',
      message: `Invalid file type. Allowed types: ${IMAGE_CONFIG.ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = (IMAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
    return {
      field: 'image',
      message: `File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }

  return null;
}

/**
 * Upload a product image to Supabase Storage
 * @param file - The image file to upload
 * @param productId - The product ID (used as a unique identifier)
 * @returns Object containing image information or throws an error
 */
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<UploadedImageInfo> {
  // Validate file first
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  // Generate a unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const fileExtension = file.name.split('.').pop() || 'png';
  const fileName = `${productId}-${timestamp}.${fileExtension}`;
  const filePath = `${productId}/${fileName}`;

  // Upload file to Supabase Storage
  // Use service role client on server to bypass RLS, otherwise use anon client
  const client = isServerEnvironment() ? supabaseServiceRole : supabase;
  const { data: uploadData, error: uploadError } = await client.storage
    .from(IMAGE_CONFIG.BUCKET_NAME)
    .upload(filePath, file, {
      upsert: false, // Don't overwrite existing files
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from(IMAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Delete a product image from Supabase Storage
 * @param imagePath - The storage path of the image to delete
 * @throws Error if deletion fails
 */
export async function deleteProductImage(imagePath: string): Promise<void> {
  if (!imagePath) {
    return;
  }

  const client = isServerEnvironment() ? supabaseServiceRole : supabase;
  const { error } = await client.storage
    .from(IMAGE_CONFIG.BUCKET_NAME)
    .remove([imagePath]);

  if (error) {
    // Log error but don't throw - deletion may fail if file doesn't exist
    console.warn(`Failed to delete image at path ${imagePath}:`, error.message);
  }
}

/**
 * Update a product image by deleting the old one and uploading a new one
 * @param newFile - The new image file
 * @param productId - The product ID
 * @param oldImagePath - The storage path of the old image (optional)
 * @returns Object containing new image information
 */
export async function updateProductImage(
  newFile: File,
  productId: string,
  oldImagePath?: string
): Promise<UploadedImageInfo> {
  // Delete old image if it exists
  if (oldImagePath) {
    await deleteProductImage(oldImagePath);
  }

  // Upload new image
  return uploadProductImage(newFile, productId);
}

/**
 * Extract image file from FormData
 * @param formData - The FormData object to extract from
 * @returns The File object or null if no image found
 */
export function extractImageFromFormData(formData: FormData): File | null {
  const imageFile = formData.get('image');

  if (imageFile instanceof File) {
    // Check if it's not an empty file (some browsers send empty File objects for missing inputs)
    if (imageFile.size > 0) {
      return imageFile;
    }
  }

  return null;
}

/**
 * Convert product data to FormData for image upload
 * @param product - The product data object
 * @param imageFile - Optional image file to include
 * @returns FormData object ready for upload
 */
export function productToFormData(
  product: Record<string, any>,
  imageFile?: File | null
): FormData {
  const formData = new FormData();

  // Add all product fields
  Object.keys(product).forEach((key) => {
    const value = product[key];
    if (key !== 'image' && value !== undefined && value !== null) {
      // Handle arrays (like subproducts)
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  return formData;
}
