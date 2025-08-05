import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAlternativeBuckets() {
  console.log('🧪 Testing alternative bucket names...');
  
  const bucketNames = ['images', 'property-images-bucket', 'my-images', 'test-bucket'];
  
  for (const bucketName of bucketNames) {
    console.log(`\n📦 Testing bucket: ${bucketName}`);
    
    try {
      // Create a simple image blob
      const pngData = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      const testImageBlob = new Blob([pngData], { type: 'image/png' });
      const testFileName = `test_${Date.now()}.png`;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`test/${testFileName}`, testImageBlob, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.log(`❌ ${bucketName}: ${error.message}`);
      } else {
        console.log(`✅ ${bucketName}: Upload successful!`);
        console.log(`📄 Data:`, data);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(`test/${testFileName}`);
        
        console.log(`🔗 Public URL: ${publicUrl}`);
        return bucketName; // Found a working bucket
      }
      
    } catch (error) {
      console.log(`❌ ${bucketName}: ${error.message}`);
    }
  }
  
  console.log('\n❌ No working buckets found. You need to create one manually.');
}

testAlternativeBuckets(); 