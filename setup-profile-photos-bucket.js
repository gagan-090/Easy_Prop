// Setup script for profile photos storage bucket
// Run this with: node setup-profile-photos-bucket.js

import { createClient } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createProfilePhotosBucket() {
  console.log('🚀 Setting up profile photos storage bucket...');
  
  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    const existingBucket = buckets.find(bucket => bucket.id === 'profile-photos');
    
    if (existingBucket) {
      console.log('✅ Profile photos bucket already exists');
      return;
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('profile-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    });
    
    if (error) {
      console.error('❌ Error creating bucket:', error);
      console.log('💡 You may need to create the bucket manually in Supabase Dashboard');
      console.log('💡 Or run the SQL migration: migration/create-profile-photos-bucket.sql');
      return;
    }
    
    console.log('✅ Profile photos bucket created successfully!');
    console.log('📊 Bucket data:', data);
    
    // Test bucket access
    const { data: testList, error: testError } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (testError) {
      console.error('❌ Error testing bucket access:', testError);
    } else {
      console.log('✅ Bucket is accessible and ready to use');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('💡 Please ensure you have the necessary permissions');
    console.log('💡 You may need to run the SQL migration manually');
  }
}

async function main() {
  await createProfilePhotosBucket();
  console.log('\n✨ Setup completed!');
}

main();