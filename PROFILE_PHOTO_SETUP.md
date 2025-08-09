# Profile Photo Upload Feature

This document explains the profile photo upload functionality that allows sellers to upload their profile photos in the dashboard, which will then be displayed on the main website.

## Features

- ✅ Profile photo upload in dashboard
- ✅ Real-time photo preview
- ✅ Automatic image optimization
- ✅ Profile photo display in navbar, dashboard, and property cards
- ✅ Fallback to default user icon when no photo is available
- ✅ Photo removal functionality
- ✅ Secure file upload with validation

## Setup Instructions

### 1. Database Setup

The `users` table already includes a `photo_url` column in the schema. If you need to add it manually:

```sql
ALTER TABLE users ADD COLUMN photo_url TEXT;
```

### 2. Storage Bucket Setup

Run the following SQL in your Supabase SQL Editor to create the profile photos storage bucket:

```sql
-- Run the migration script
\i migration/create-profile-photos-bucket.sql
```

Or manually execute:

```sql
-- Create profile-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Create RLS policies for profile-photos bucket
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile photos are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');
```

### 3. Test the Setup

Run the test script to verify everything is working:

```bash
node test-profile-photo.js
```

## Components

### ProfilePhotoUpload Component

Located at `src/components/ProfilePhotoUpload.jsx`

**Props:**
- `currentPhotoUrl` (string): Current photo URL from database
- `onPhotoUpdate` (function): Callback when photo is updated
- `size` (string): Size variant ('small', 'medium', 'large', 'xlarge')

**Usage:**
```jsx
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';

<ProfilePhotoUpload 
  currentPhotoUrl={user?.photoURL}
  onPhotoUpdate={(newUrl) => {
    // Handle photo update
  }}
  size="large"
/>
```

## Integration Points

### 1. Dashboard Layout
- Sidebar user card displays profile photo
- Header dropdown shows profile photo

### 2. User Profile Page
- Large profile photo with upload functionality
- Edit profile modal includes photo management

### 3. Main Website Navbar
- User profile photo in authenticated state
- Mobile menu shows profile photo

### 4. Property Cards
- Seller's profile photo displayed in property listings
- Fallback to default icon when no photo available

## File Structure

```
src/
├── components/
│   └── ProfilePhotoUpload.jsx     # Main profile photo component
├── services/
│   └── supabaseService.js         # Upload functions
├── contexts/
│   └── AuthContext.jsx            # User data with photo URL
├── layouts/
│   └── DashboardLayout.jsx        # Dashboard integration
├── pages/
│   └── UserProfile.jsx            # Profile page integration
└── components/
    ├── Navbar.jsx                 # Main site navbar
    └── PropertyCard.jsx           # Property listing cards

migration/
└── create-profile-photos-bucket.sql  # Storage bucket setup

test-profile-photo.js              # Test script
PROFILE_PHOTO_SETUP.md             # This documentation
```

## API Functions

### uploadProfilePhoto(userId, file)
Uploads a profile photo to Supabase Storage.

**Parameters:**
- `userId` (string): User's Firebase UID
- `file` (File): Image file to upload

**Returns:**
```javascript
{
  success: boolean,
  data: {
    publicUrl: string,
    filePath: string,
    fileName: string
  } | null,
  error: string | null
}
```

### updateUserProfile(userId, updates)
Updates user profile data including photo URL.

**Parameters:**
- `userId` (string): User's Firebase UID
- `updates` (object): Profile updates including `photo_url`

## Security Features

- ✅ File type validation (images only)
- ✅ File size limit (5MB)
- ✅ User authentication required
- ✅ Row Level Security (RLS) policies
- ✅ Users can only upload/modify their own photos
- ✅ Public read access for displaying photos

## Error Handling

The component handles various error scenarios:
- Invalid file types
- File size too large
- Network errors during upload
- Database update failures
- Missing permissions

## Browser Compatibility

- ✅ Modern browsers with File API support
- ✅ Mobile browsers for photo capture
- ✅ Progressive enhancement (fallback to default icons)

## Performance Considerations

- Images are uploaded directly to Supabase Storage
- CDN delivery for fast loading
- Lazy loading for profile photos
- Optimized image sizes for different use cases

## Troubleshooting

### Common Issues

1. **Bucket not found error**
   - Run the storage bucket creation SQL
   - Check Supabase dashboard for bucket existence

2. **Upload permission denied**
   - Verify RLS policies are correctly set
   - Check user authentication status

3. **Photo not displaying**
   - Check if photo_url is saved in database
   - Verify image URL is accessible
   - Check browser console for errors

4. **File size errors**
   - Ensure images are under 5MB
   - Consider image compression for large files

### Debug Steps

1. Check browser console for errors
2. Verify Supabase Storage bucket exists
3. Test with the provided test script
4. Check network tab for failed requests
5. Verify user authentication state

## Future Enhancements

- [ ] Image cropping/editing functionality
- [ ] Multiple photo upload for galleries
- [ ] Automatic image optimization
- [ ] Photo approval workflow for moderation
- [ ] Bulk photo management for admins