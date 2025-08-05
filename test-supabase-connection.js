// Test script for Supabase connection and RLS policies
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection and RLS policies...\n');

  // Test 1: Basic connection
  try {
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    console.log('✅ Basic connection successful\n');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return;
  }

  // Test 2: Try to read from properties table
  try {
    console.log('2️⃣ Testing read access to properties table...');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Read access failed:', error);
    } else {
      console.log('✅ Read access successful');
      console.log('📊 Properties found:', data?.length || 0);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Read test failed:', error);
  }

  // Test 3: Try to insert a test property (this should fail with RLS)
  try {
    console.log('3️⃣ Testing insert access to properties table...');
    
    // First, create a test user
    const testUserId = `test-user-${Date.now()}`;
    console.log('👤 Creating test user:', testUserId);
    
    const { error: createUserError } = await supabase
      .from('users')
      .insert([{
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        email_verified: false,
        phone_verified: false,
        stats: {
          totalProperties: 0,
          propertiesForSale: 0,
          propertiesForRent: 0,
          totalCustomers: 0,
          totalCities: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalLeads: 0,
          activeLeads: 0,
          convertedLeads: 0
        },
        preferences: {
          theme: 'light',
          notifications: true,
          emailUpdates: true
        },
        profile: {},
        subscription: {}
      }]);
    
    if (createUserError) {
      console.error('❌ Error creating test user:', createUserError);
      console.log('💡 This might be due to RLS policies or existing user');
    } else {
      console.log('✅ Test user created successfully');
    }
    
    const testProperty = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: testUserId,
      title: 'Test Property - RLS Test',
      description: 'This is a test property to check RLS policies',
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      country: 'India',
      bedrooms: 2,
      bathrooms: 1,
      area: 1000,
      type: 'sale',
      category: 'residential',
      property_type: 'apartment',
      status: 'active',
      price: 100000,
      currency: 'INR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([testProperty])
      .select();

    if (error) {
      console.error('❌ Insert failed (expected with RLS):', error.message);
      console.log('💡 This is expected if RLS is enabled. You need to:');
      console.log('   - Disable RLS for development, OR');
      console.log('   - Create proper RLS policies');
    } else {
      console.log('✅ Insert successful (RLS might be disabled)');
      console.log('📊 Inserted property:', data);
    }
    console.log('');
  } catch (error) {
    console.error('❌ Insert test failed:', error);
  }

  // Test 4: Check table structure
  try {
    console.log('4️⃣ Checking table structure...');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Structure check failed:', error);
    } else {
      console.log('✅ Table structure accessible');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Structure check failed:', error);
  }

  console.log('🎯 Next Steps:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to Authentication → Policies');
  console.log('3. Find the "properties" table');
  console.log('4. Either disable RLS or create proper policies');
  console.log('5. Run this test again to verify the fix');
}

// Run the test
testSupabaseConnection().catch(console.error); 