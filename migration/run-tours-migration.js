#!/usr/bin/env node

// run-tours-migration.js - Script to run the tours table migration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🚀 Running Tours Table Migration');
console.log('='.repeat(50));

// Check environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('   Please set SUPABASE_URL and SUPABASE_KEY in your .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('📖 Reading tours migration file...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'add-tours-table.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error('Tours migration file not found: add-tours-table.sql');
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ Migration file loaded');
    
    console.log('🔧 Executing migration...');
    
    // Note: Supabase JS client doesn't support running raw SQL directly
    // This script will provide instructions for manual execution
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 MANUAL MIGRATION REQUIRED');
    console.log('='.repeat(50));
    
    console.log('\nThe tours table migration needs to be run manually in Supabase.');
    console.log('\nSteps to complete the migration:');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the contents of: migration/add-tours-table.sql');
    console.log('6. Run the query');
    
    console.log('\nAlternatively, you can copy the SQL content below:');
    console.log('\n' + '-'.repeat(50));
    console.log(sqlContent);
    console.log('-'.repeat(50));
    
    console.log('\n✅ After running the migration, tour scheduling will work properly.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Test if tours table exists
async function testToursTable() {
  try {
    console.log('🔍 Testing if tours table exists...');
    
    const { data, error } = await supabase
      .from('tours')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "public.tours" does not exist')) {
        console.log('❌ Tours table does not exist');
        return false;
      }
      throw error;
    }
    
    console.log('✅ Tours table exists and is accessible');
    return true;
  } catch (error) {
    console.error('❌ Error testing tours table:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const tableExists = await testToursTable();
  
  if (tableExists) {
    console.log('\n🎉 Tours table already exists! No migration needed.');
  } else {
    console.log('\n⚠️ Tours table missing. Migration required.');
    await runMigration();
  }
}

main().catch(console.error);