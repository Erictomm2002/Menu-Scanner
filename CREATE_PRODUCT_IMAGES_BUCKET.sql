-- Create Supabase Storage bucket for product images
-- Run this migration in your Supabase SQL editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) for the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the product-images bucket

-- Policy: Allow public read access to product images
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- Policy: Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Optional: Create a function to automatically clean up storage when a product is deleted
CREATE OR REPLACE FUNCTION delete_product_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the image from storage if it exists
  IF OLD.image_path IS NOT NULL THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'product-images'
    AND path = OLD.image_path;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create trigger to automatically clean up images on product deletion
DROP TRIGGER IF EXISTS on_product_delete ON products;
CREATE TRIGGER on_product_delete
AFTER DELETE ON products
FOR EACH ROW
EXECUTE FUNCTION delete_product_image();
