// validateImport.js - Validate imported data
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateImport() {
  try {
    console.log('🔍 Validating imported data...\n');
    
    // Count records in each table
    const tables = ['users', 'properties', 'leads', 'revenue', 'analytics'];
    const results = {};
    
    for (const tableName of tables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error(`❌ Error counting ${tableName}:`, error.message);
          results[tableName] = 'Error';
        } else {
          results[tableName] = count || 0;
          console.log(`📊 ${tableName}: ${count || 0} records`);
        }
      } catch (error) {
        console.error(`❌ Error counting ${tableName}:`, error.message);
        results[tableName] = 'Error';
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 DETAILED VALIDATION');
    console.log('='.repeat(50));
    
    // Validate user stats
    if (results.users > 0) {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('stats');
        
        if (!error && users) {
          let usersWithProperties = 0;
          let usersWithStats = 0;
          
          users.forEach(user => {
            if (user.stats?.total_properties > 0) {
              usersWithProperties++;
            }
            if (user.stats) {
              usersWithStats++;
            }
          });
          
          console.log(`👥 Total users: ${users.length}`);
          console.log(`🏠 Users with properties: ${usersWithProperties}`);
          console.log(`📊 Users with stats: ${usersWithStats}`);
        }
      } catch (error) {
        console.error('❌ Error validating users:', error.message);
      }
    }
    
    // Validate properties
    if (results.properties > 0) {
      try {
        const { data: properties, error } = await supabase
          .from('properties')
          .select('status, images, latitude, longitude');
        
        if (!error && properties) {
          let activeProperties = 0;
          let propertiesWithImages = 0;
          let propertiesWithLocation = 0;
          
          properties.forEach(property => {
            if (property.status === 'active') {
              activeProperties++;
            }
            if (property.images && property.images.length > 0) {
              propertiesWithImages++;
            }
            if (property.latitude && property.longitude) {
              propertiesWithLocation++;
            }
          });
          
          console.log(`🏠 Active properties: ${activeProperties}`);
          console.log(`📸 Properties with images: ${propertiesWithImages}`);
          console.log(`📍 Properties with coordinates: ${propertiesWithLocation}`);
        }
      } catch (error) {
        console.error('❌ Error validating properties:', error.message);
      }
    }
    
    // Validate leads
    if (results.leads > 0) {
      try {
        const { data: leads, error } = await supabase
          .from('leads')
          .select('status, notes');
        
        if (!error && leads) {
          let activeLeads = 0;
          let convertedLeads = 0;
          let leadsWithNotes = 0;
          
          leads.forEach(lead => {
            if (['new', 'contacted', 'qualified'].includes(lead.status)) {
              activeLeads++;
            }
            if (lead.status === 'converted') {
              convertedLeads++;
            }
            if (lead.notes && lead.notes.length > 0) {
              leadsWithNotes++;
            }
          });
          
          console.log(`🎯 Active leads: ${activeLeads}`);
          console.log(`✅ Converted leads: ${convertedLeads}`);
          console.log(`📝 Leads with notes: ${leadsWithNotes}`);
        }
      } catch (error) {
        console.error('❌ Error validating leads:', error.message);
      }
    }
    
    // Validate revenue
    if (results.revenue > 0) {
      try {
        const { data: revenue, error } = await supabase
          .from('revenue')
          .select('payment_status, amount');
        
        if (!error && revenue) {
          let totalRevenue = 0;
          let completedTransactions = 0;
          
          revenue.forEach(record => {
            if (record.payment_status === 'completed') {
              completedTransactions++;
              totalRevenue += record.amount || 0;
            }
          });
          
          console.log(`💰 Total revenue: ₹${totalRevenue.toLocaleString()}`);
          console.log(`✅ Completed transactions: ${completedTransactions}`);
        }
      } catch (error) {
        console.error('❌ Error validating revenue:', error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Validation completed!');
    
    // Summary
    const totalRecords = Object.values(results).reduce((sum, count) => {
      return sum + (typeof count === 'number' ? count : 0);
    }, 0);
    
    console.log(`📊 Total records imported: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('⚠️  No data found. Make sure to:');
      console.log('   1. Export data from SQL database');
      console.log('   2. Place JSON files in migration/data/ directory');
      console.log('   3. Run the import scripts');
      console.log('   4. Check Supabase connection and table structure');
    }
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
  }
}

validateImport();