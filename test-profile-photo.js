// Test script for profile photo upload functionality
// Run this with: node test-profile-photo.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

async function testProfilePhotoBucket() {
  console.log('🧪 Testing profile photo bucket...');
  
  try {
    // Test bucket existence
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return;
    }
    
    const profilePhotosBucket = buckets.find(bucket => bucket.id === 'profile-photos');
    
    if (profilePhotosBucket) {
      console.log('✅ Profile photos bucket exists');
      console.log('📊 Bucket details:', {
        id: profilePhotosBucket.id,
        name: profilePhotosBucket.name,
        public: profilePhotosBucket.public,
        file_size_limit: profilePhotosBucket.file_size_limit,
        allowed_mime_types: profilePhotosBucket.allowed_mime_types
      });
    } else {
      console.log('⚠️ Profile photos bucket does not exist');
      console.log('📝 Available buckets:', buckets.map(b => b.id));
      console.log('💡 Please run the create-profile-photos-bucket.sql migration');
    }
    
    // Test listing files in the bucket (should work even if empty)
    const { data: files, error: filesError } = await supabase.storage
      .from('profile-photos')
      .list('', { limit: 1 });
    
    if (filesError) {
      console.error('❌ Error accessing profile photos bucket:', filesError);
    } else {
      console.log('✅ Profile photos bucket is accessible');
      console.log(`📁 Files in bucket: ${files.length}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testUserTable() {
  console.log('🧪 Testing users table photo_url column...');
  
  try {
    // Test if photo_url column exists by trying to select it
    const { data, error } = await supabase
      .from('users')
      .select('id, photo_url')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing users table:', error);
      if (error.message.includes('photo_url')) {
        console.log('💡 The photo_url column might not exist in the users table');
        console.log('💡 Please ensure the database schema includes photo_url column');
      }
    } else {
      console.log('✅ Users table photo_url column is accessible');
      console.log(`📊 Sample data: ${data.length} records found`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting profile photo functionality tests...\n');
  
  await testProfilePhotoBucket();
  console.log('');
  await testUserTable();
  
  console.log('\n✨ Tests completed!');
}

runTests();