#!/usr/bin/env node

// setup.js - Setup script for migration environment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 EasyProp Migration Setup');
console.log('='.repeat(50));

// Check if data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
} else {
  console.log('📁 Data directory already exists');
}

// Check for required files
const requiredFiles = [
  'users_export.json',
  'properties_export.json',
  'leads_export.json',
  'revenue_export.json',
  'analytics_export.json'
];

console.log('\n📋 Checking for required data files:');
let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

// Check environment variables
console.log('\n🔧 Checking environment configuration:');
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

let missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`❌ ${envVar} - MISSING`);
    missingEnvVars.push(envVar);
  }
});

// Check if .env file exists in parent directory
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  .env file not found in project root');
  console.log('   Create a .env file with your Firebase configuration');
}

// Summary and next steps
console.log('\n' + '='.repeat(50));
console.log('📊 SETUP SUMMARY');
console.log('='.repeat(50));

if (missingFiles.length === 0 && missingEnvVars.length === 0) {
  console.log('🎉 Setup complete! You can now run the migration.');
  console.log('\nNext steps:');
  console.log('1. npm install (if not already done)');
  console.log('2. npm run migrate (to start migration)');
  console.log('3. npm run validate (to validate results)');
} else {
  console.log('⚠️  Setup incomplete. Please address the following:');
  
  if (missingFiles.length > 0) {
    console.log('\n📁 Missing data files:');
    missingFiles.forEach(file => {
      console.log(`   - Export your SQL data and save as: data/${file}`);
    });
    console.log('\n   Use the SQL queries in SQL_TO_FIRESTORE_MIGRATION.md');
  }
  
  if (missingEnvVars.length > 0) {
    console.log('\n🔧 Missing environment variables:');
    missingEnvVars.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n   Add these to your .env file in the project root');
  }
}

console.log('\n📚 For detailed instructions, see migration/README.md');
console.log('🆘 For help, check the troubleshooting section in README.md');

// Create a sample .env template if it doesn't exist
const envTemplatePath = path.join(__dirname, '.env.example');
if (!fs.existsSync(envTemplatePath)) {
  const envTemplate = `# Supabase Configuration for Migration
# Copy these values from your Supabase project settings

SUPABASE_URL=https://xjpjjxlnnxerxmvzvgka.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqcGpqeGxubnhlcnhtdnp2Z2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTA4MzcsImV4cCI6MjA2OTY4NjgzN30.WHskY1Pbli6c6K2WhJ5mfoqb0axq0FF2QAl0v5tLlvk
`;
  
  fs.writeFileSync(envTemplatePath, envTemplate);
  console.log('\n📝 Created .env.example template file');
}