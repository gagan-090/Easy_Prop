import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUpload() {
  console.log('🧪 Testing image upload to storage...');
  
  try {
    // Create a simple image blob (1x1 pixel PNG)
    const pngData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testImageBlob = new Blob([pngData], { type: 'image/png' });
    const testFileName = `test_image_${Date.now()}.png`;
    
    console.log(`📤 Attempting to upload ${testFileName}...`);
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(`test/${testFileName}`, testImageBlob, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload failed:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
    } else {
      console.log('✅ Upload successful!');
      console.log('📄 Upload data:', data);
      
      // Try to get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(`test/${testFileName}`);
      
      console.log('🔗 Public URL:', publicUrl);
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testImageUpload(); 