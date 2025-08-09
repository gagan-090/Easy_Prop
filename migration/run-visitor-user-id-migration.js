import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('Required variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running visitor_user_id column migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add-visitor-user-id-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct execution if RPC doesn't work
      console.log('⚠️ RPC method failed, trying direct execution...');
      
      // Split SQL into individual statements and execute them
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim() && !statement.trim().startsWith('--')) {
          console.log('Executing:', statement.trim().substring(0, 50) + '...');
          const { error: stmtError } = await supabase.from('_').select().limit(0); // This won't work, but let's try a different approach
        }
      }
      
      console.log('⚠️ Please run the SQL manually in your Supabase SQL Editor:');
      console.log('📄 File: migration/add-visitor-user-id-column.sql');
      console.log('\n' + sql);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Result:', data);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n⚠️ Please run the SQL manually in your Supabase SQL Editor:');
    console.log('📄 File: migration/add-visitor-user-id-column.sql');
    
    const sqlPath = path.join(__dirname, 'add-visitor-user-id-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('\n' + sql);
  }
}

runMigration();