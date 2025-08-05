// importRevenue.js
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

async function importRevenue() {
  try {
    const revenueData = JSON.parse(fs.readFileSync('data/revenue_export.json', 'utf8'));
    
    console.log(`📊 Starting import of ${revenueData.length} revenue records...`);
    
    for (const revenue of revenueData) {
      const revenueRecord = {
        id: revenue.id,
        user_id: revenue.userId,
        property_id: revenue.propertyId || null,
        lead_id: revenue.leadId || null,
        
        // Revenue Details
        amount: revenue.amount || 0,
        currency: revenue.currency || 'INR',
        type: revenue.type || 'commission',
        
        // Transaction Details
        transaction_id: revenue.transactionId || '',
        payment_method: revenue.paymentMethod || 'bank_transfer',
        payment_status: revenue.paymentStatus || 'completed',
        
        // Dates
        created_at: revenue.createdAt,
        received_at: revenue.receivedAt || revenue.createdAt,
        due_date: revenue.dueDate || null,
        
        // Additional Info
        description: revenue.description || '',
        category: revenue.category || 'primary',
        recurring: revenue.recurring || false,
        
        // Tax Information
        tax_amount: revenue.taxAmount || 0,
        tax_rate: revenue.taxRate || 0,
        net_amount: revenue.netAmount || revenue.amount,
        
        // Client Information
        client_name: revenue.clientName || '',
        client_email: revenue.clientEmail || '',
        client_phone: revenue.clientPhone || ''
      };
      
      const { data, error } = await supabase
        .from('revenue')
        .upsert(revenueRecord, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error importing revenue ${revenue.id}:`, error.message);
      } else {
        console.log(`✅ Imported revenue: ${revenue.amount} ${revenue.currency}`);
      }
    }
    
    console.log('🎉 Revenue import completed!');
  } catch (error) {
    console.error('❌ Error importing revenue:', error);
  }
}

importRevenue();