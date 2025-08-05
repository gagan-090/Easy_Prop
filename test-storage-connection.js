import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageConnection() {
  console.log('🔍 Testing Supabase Storage connection...');
  
  try {
    // Test 1: List buckets
    console.log('\n📦 Testing bucket listing...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      console.log('✅ Buckets found:', buckets.map(b => b.name));
      
      // Check if property-images bucket exists
      const propertyImagesBucket = buckets.find(b => b.name === 'property-images');
      if (propertyImagesBucket) {
        console.log('✅ property-images bucket exists');
        console.log('📋 Bucket details:', propertyImagesBucket);
      } else {
        console.log('❌ property-images bucket NOT found');
        console.log('Available buckets:', buckets.map(b => b.name));
      }
    }
    
    // Test 2: Try to list files in property-images bucket
    console.log('\n📁 Testing file listing in property-images bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from('property-images')
      .list('', {
        limit: 10,
        offset: 0
      });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
    } else {
      console.log('✅ Files in bucket:', files);
    }
    
    // Test 3: Try to upload a test file
    console.log('\n📤 Testing file upload...');
    const testContent = 'This is a test file for storage connection';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test_${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(`test/${testFileName}`, testBlob, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError);
      console.error('Error details:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error
      });
    } else {
      console.log('✅ Test file uploaded successfully:', uploadData);
      
      // Try to get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(`test/${testFileName}`);
      
      console.log('🔗 Public URL:', publicUrl);
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testStorageConnection(); 