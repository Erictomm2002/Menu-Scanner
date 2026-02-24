-- Add image columns to products table
-- Run this migration in your Supabase SQL editor

ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS image_name TEXT,
ADD COLUMN IF NOT EXISTS image_size BIGINT,
ADD COLUMN IF NOT EXISTS image_mime_type TEXT;

-- Add comment to document the image columns
COMMENT ON COLUMN products.image_url IS 'Public URL of the product image from Supabase Storage';
COMMENT ON COLUMN products.image_path IS 'Storage path of the product image';
COMMENT ON COLUMN products.image_name IS 'Original filename of the uploaded image';
COMMENT ON COLUMN products.image_size IS 'File size in bytes';
COMMENT ON COLUMN products.image_mime_type IS 'MIME type of the image (e.g., image/png, image/jpeg)';
