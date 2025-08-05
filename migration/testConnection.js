// testConnection.js - Test Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Set environment variables directly if dotenv fails
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://xjpjjxlnnxerxmvzvgka.supabase.co';
}
if (!process.env.SUPABASE_KEY) {
  process.env.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk';
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('🔧 Testing Supabase Connection...');
console.log('='.repeat(40));

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 Testing connection to:', supabaseUrl);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n💡 The "users" table doesn\'t exist yet.');
        console.log('   Run the SQL schema in your Supabase SQL Editor first:');
        console.log('   Copy contents of migration/supabase-schema.sql');
      }
    } else {
      console.log('✅ Connection successful!');
      console.log(`📊 Users table has ${data || 0} records`);
    }
    
    // Test other tables
    const tables = ['properties', 'leads', 'revenue', 'analytics'];
    
    for (const table of tables) {
      try {
        const { count, error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (tableError) {
          console.log(`❌ ${table}: ${tableError.message}`);
        } else {
          console.log(`✅ ${table}: ${count || 0} records`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testConnection();