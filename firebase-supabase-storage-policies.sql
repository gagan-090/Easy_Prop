-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to property-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes to property-images" ON storage.objects;

-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to all files in property-images bucket
CREATE POLICY "Public read access for property images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);

-- Policy 2: Allow uploads to property-images bucket (for Firebase authenticated users)
-- Since we're using Firebase auth, we'll allow anon role but validate in application layer
CREATE POLICY "Allow property image uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND
  -- Allow uploads to the properties folder structure
  (storage.foldername(name))[1] = 'properties'
);

-- Policy 3: Allow updates to property images
CREATE POLICY "Allow property image updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = 'properties'
);

-- Policy 4: Allow deletes of property images
CREATE POLICY "Allow property image deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = 'properties'
);

-- Policy 5: Allow public read access to bucket information
CREATE POLICY "Public bucket access" ON storage.buckets
FOR SELECT USING (true);