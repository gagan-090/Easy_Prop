-- Simple storage policies for property-images bucket
-- Run these one by one in Supabase SQL Editor

-- Policy 1: Allow public read access
CREATE POLICY "Public read for property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Policy 2: Allow uploads (no auth restriction for Firebase users)
CREATE POLICY "Allow property uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'property-images');

-- Policy 3: Allow updates
CREATE POLICY "Allow property updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'property-images');

-- Policy 4: Allow deletes
CREATE POLICY "Allow property deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'property-images');