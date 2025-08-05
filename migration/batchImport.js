// batchImport.js - Import all data in sequence
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runBatchImport() {
  const scripts = [
    'node importUsers.js',
    'node importProperties.js',
    'node importLeads.js',
    'node importRevenue.js',
    'node importAnalytics.js'
  ];
  
  console.log('Starting batch import process...\n');
  
  for (const script of scripts) {
    try {
      console.log(`Running: ${script}`);
      console.log('='.repeat(50));
      
      const { stdout, stderr } = await execAsync(script, { cwd: './migration' });
      
      if (stdout) {
        console.log(stdout);
      }
      
      if (stderr) {
        console.error('Warnings/Errors:', stderr);
      }
      
      console.log(`✅ Completed: ${script}\n`);
      
      // Add a small delay between imports to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error running ${script}:`, error.message);
      console.log('Continuing with next script...\n');
    }
  }
  
  console.log('🎉 Batch import process completed!');
  console.log('Run "node validateImport.js" to validate the imported data.');
}

runBatchImport();