-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to all files in property-images bucket
CREATE POLICY "Allow public read access to property-images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);

-- Policy 2: Allow anonymous users to upload to property-images bucket (since using Firebase Auth)
CREATE POLICY "Allow uploads to property-images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images'
);

-- Policy 3: Allow updates to files in property-images bucket
CREATE POLICY "Allow updates to property-images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images'
);

-- Policy 4: Allow deletes from property-images bucket
CREATE POLICY "Allow deletes to property-images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images'
);

-- Policy 5: Allow public read access to bucket information
CREATE POLICY "Allow public read access to buckets" ON storage.buckets
FOR SELECT USING (true);