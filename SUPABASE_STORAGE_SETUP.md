# Supabase Storage Setup Guide

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Create a new bucket**
5. Configure the bucket:
   - **Name**: `property-images`
   - **Public bucket**: ✅ Check this (so images can be accessed publicly)
   - **File size limit**: 50MB (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or specific types like `image/jpeg,image/png,image/webp`)

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage > Policies** and add these policies:

### Policy 1: Allow authenticated users to upload images
```sql
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);
```

### Policy 2: Allow public read access to images
```sql
CREATE POLICY "Allow public read access to images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);
```

### Policy 3: Allow users to update their own images
```sql
CREATE POLICY "Allow users to update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);
```

### Policy 4: Allow users to delete their own images
```sql
CREATE POLICY "Allow users to delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND 
  auth.role() = 'authenticated'
);
```

## Step 3: Test the Setup

After setting up the bucket and policies, try uploading a property with images. The images should now be:

1. ✅ Uploaded to Supabase Storage
2. ✅ Stored with persistent URLs (not blob URLs)
3. ✅ Displayed correctly in all components
4. ✅ Accessible publicly

## Troubleshooting

### If images still don't upload:
1. Check the browser console for errors
2. Verify the bucket name is exactly `property-images`
3. Ensure all storage policies are properly configured
4. Check that your Supabase client has the correct permissions

### If images upload but don't display:
1. Check that the `isValidImage` function in components allows Supabase URLs
2. Verify the public URLs are being generated correctly
3. Test the image URLs directly in a browser

## Quick Fix for Development

If you want to disable RLS for development (not recommended for production):

```sql
-- Disable RLS on storage.objects for development
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**Note**: This is only for development. In production, always use proper RLS policies. 