#!/usr/bin/env node

// Simple script to help run the tours migration
console.log('🚀 Tours Migration Helper');
console.log('='.repeat(50));

console.log('\nThe tours table needs to be created in your Supabase database.');
console.log('\nTo fix the tour scheduling error, please follow these steps:');
console.log('\n1. Go to your Supabase dashboard: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to SQL Editor');
console.log('4. Create a new query');
console.log('5. Copy and paste the contents of: migration/add-tours-table.sql');
console.log('6. Run the query');

console.log('\nAlternatively, you can run:');
console.log('node migration/run-tours-migration.js');

console.log('\nAfter running the migration, tour scheduling will work properly.');
console.log('\nThe error you encountered was because:');
console.log('- The tours table doesn\'t exist in your database');
console.log('- The scheduleTour function was trying to access properties of undefined error objects');
console.log('- The tour data structure had mismatched field names');

console.log('\n✅ I\'ve already fixed the error handling in the code.');
console.log('✅ I\'ve also fixed the data structure mismatch.');
console.log('✅ Now you just need to create the tours table in Supabase.'); 