-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to all files in property-images bucket
CREATE POLICY "Allow public read access to property-images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);

-- Policy 2: Allow authenticated users to upload to property-images bucket
CREATE POLICY "Allow authenticated uploads to property-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their files in property-images bucket
CREATE POLICY "Allow authenticated updates to property-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their files in property-images bucket
CREATE POLICY "Allow authenticated deletes to property-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);

-- Policy 5: Allow public read access to bucket information
CREATE POLICY "Allow public read access to buckets" ON storage.buckets
FOR SELECT USING (true); 