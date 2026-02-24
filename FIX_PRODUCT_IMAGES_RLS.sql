-- Fix RLS policies for product-images bucket
-- Run this in your Supabase SQL editor to allow uploads from the API

-- Drop existing policies that only allow authenticated users
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Allow public (anon) and authenticated users to upload product images
CREATE POLICY "Public and authenticated users can upload product images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'product-images'
);

-- Allow public (anon) and authenticated users to update product images
CREATE POLICY "Public and authenticated users can update product images"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (
  bucket_id = 'product-images'
)
WITH CHECK (
  bucket_id = 'product-images'
);

-- Allow public (anon) and authenticated users to delete product images
CREATE POLICY "Public and authenticated users can delete product images"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (
  bucket_id = 'product-images'
);
