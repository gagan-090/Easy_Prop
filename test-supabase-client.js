// Test script to verify centralized Supabase client
import supabase from './src/services/supabaseClient.js';

console.log('🧪 Testing centralized Supabase client...');

// Test basic connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
}

// Test property retrieval
async function testPropertyRetrieval() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Property retrieval failed:', error);
      return false;
    }
    
    console.log('✅ Property retrieval successful');
    console.log('📊 Sample property:', data[0] ? {
      id: data[0].id,
      title: data[0].title,
      address: data[0].address,
      city: data[0].city,
      images: data[0].images
    } : 'No properties found');
    return true;
  } catch (error) {
    console.error('❌ Property retrieval failed:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting tests...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Connection test failed');
    return;
  }
  
  const propertyOk = await testPropertyRetrieval();
  if (!propertyOk) {
    console.log('❌ Property test failed');
    return;
  }
  
  console.log('\n🎉 All tests passed!');
}

runTests(); 