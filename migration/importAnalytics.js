// importAnalytics.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importAnalytics() {
  try {
    const analyticsData = JSON.parse(fs.readFileSync('data/analytics_export.json', 'utf8'));
    
    console.log(`📊 Starting import of ${analyticsData.length} analytics records...`);
    
    for (const analytics of analyticsData) {
      const analyticsRecord = {
        id: `${analytics.userId}_${analytics.date}`,
        date: analytics.date,
        user_id: analytics.userId,
        
        // Daily Metrics (stored as JSONB)
        views: {
          total: analytics.total_views || 0,
          unique: analytics.unique_views || 0,
          properties: {}
        },
        
        // Lead Metrics (stored as JSONB)
        leads: {
          total: analytics.total_leads || 0,
          new: analytics.new_leads || 0,
          converted: analytics.converted_leads || 0,
          sources: {}
        },
        
        // Revenue Metrics (stored as JSONB)
        revenue: {
          total: analytics.total_revenue || 0,
          transactions: analytics.transactions || 0,
          average: analytics.average_transaction || 0
        },
        
        // Property Metrics (stored as JSONB)
        properties: {
          active: analytics.active_properties || 0,
          sold: analytics.sold_properties || 0,
          rented: analytics.rented_properties || 0,
          new: analytics.new_properties || 0
        },
        
        // User Activity (stored as JSONB)
        activity: {
          logins: analytics.logins || 0,
          time_spent: analytics.time_spent || 0,
          actions: {}
        },
        
        // Traffic Sources (stored as JSONB)
        traffic: {
          direct: analytics.direct_traffic || 0,
          search: analytics.search_traffic || 0,
          social: analytics.social_traffic || 0,
          referral: analytics.referral_traffic || 0
        }
      };
      
      const { data, error } = await supabase
        .from('analytics')
        .upsert(analyticsRecord, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error importing analytics ${analytics.date}:`, error.message);
      } else {
        console.log(`✅ Imported analytics: ${analytics.date} for user ${analytics.userId}`);
      }
    }
    
    console.log('🎉 Analytics import completed!');
  } catch (error) {
    console.error('❌ Error importing analytics:', error);
  }
}

importAnalytics();