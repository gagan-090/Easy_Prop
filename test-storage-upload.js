import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageUpload() {
  console.log('🧪 Testing storage upload after RLS fix...');
  
  try {
    // Create a simple test file
    const testContent = 'Hello from test upload!';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFileName = `test_upload_${Date.now()}.txt`;
    
    console.log(`📤 Attempting to upload ${testFileName}...`);
    
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(`test/${testFileName}`, testBlob, {
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

testStorageUpload(); 