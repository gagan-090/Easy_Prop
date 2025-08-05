// Script to check the actual schema of the properties table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableSchema() {
  console.log('🔍 Checking table schemas...\n');

  // Check properties table schema
  try {
    console.log('📋 Properties table schema:');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Error checking properties schema:', error);
    } else {
      console.log('✅ Properties table accessible');
      // The schema information will be in the response headers or we can infer from data
    }
  } catch (error) {
    console.error('❌ Properties schema check failed:', error);
  }

  // Try to get a sample record to see the structure
  try {
    console.log('\n📊 Sample properties record:');
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error getting sample:', error);
    } else {
      console.log('📋 Available columns:', data.length > 0 ? Object.keys(data[0]) : 'No records found');
      if (data.length > 0) {
        console.log('📄 Sample record:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Sample check failed:', error);
  }

  // Check users table schema
  try {
    console.log('\n👥 Users table schema:');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error checking users schema:', error);
    } else {
      console.log('✅ Users table accessible');
      console.log('📋 Available columns:', data.length > 0 ? Object.keys(data[0]) : 'No records found');
      if (data.length > 0) {
        console.log('📄 Sample user record:', JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Users schema check failed:', error);
  }

  // Check if other tables exist
  const tables = ['leads', 'revenue', 'analytics'];
  
  for (const table of tables) {
    try {
      console.log(`\n📊 Checking ${table} table:`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table} table error:`, error.message);
      } else {
        console.log(`✅ ${table} table accessible`);
        console.log(`📋 Available columns:`, data.length > 0 ? Object.keys(data[0]) : 'No records found');
      }
    } catch (error) {
      console.log(`❌ ${table} table check failed:`, error.message);
    }
  }
}

// Run the check
checkTableSchema().catch(console.error); 