// importLeads.js
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

async function importLeads() {
  try {
    const leadsData = JSON.parse(fs.readFileSync('data/leads_export.json', 'utf8'));
    
    console.log(`📊 Starting import of ${leadsData.length} leads...`);
    
    for (const lead of leadsData) {
      const leadData = {
        id: lead.id,
        user_id: lead.userId,
        property_id: lead.propertyId,
        
        // Lead Information
        name: lead.name,
        email: lead.email,
        phone: lead.phone || '',
        
        // Inquiry Details
        message: lead.message || '',
        budget: lead.budget || '',
        requirements: lead.requirements || '',
        
        // Lead Classification
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        source: lead.source || 'website',
        
        // Contact Information
        contact_method: lead.contactMethod || 'email',
        preferred_time: lead.preferredTime || 'anytime',
        
        // Lead Scoring
        score: lead.score || 0,
        rating: lead.rating || 0,
        
        // Follow-up
        last_contact_at: lead.lastContactAt || null,
        next_follow_up: lead.nextFollowUp || null,
        follow_up_count: lead.followUpCount || 0,
        
        // Additional Details
        location: lead.location || '',
        occupation: lead.occupation || '',
        company: lead.company || '',
        
        // Timestamps
        created_at: lead.createdAt,
        updated_at: lead.updatedAt,
        
        // Notes & History (stored as JSONB)
        notes: Array.isArray(lead.notes) ? lead.notes : [],
        history: [],
        
        // Conversion Tracking
        converted_at: lead.convertedAt || null,
        conversion_value: lead.conversionValue || 0,
        
        // Communication Log (stored as JSONB)
        communications: Array.isArray(lead.communications) ? lead.communications : []
      };
      
      const { data, error } = await supabase
        .from('leads')
        .upsert(leadData, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error importing lead ${lead.name}:`, error.message);
      } else {
        console.log(`✅ Imported lead: ${lead.name} - ${lead.email}`);
      }
    }
    
    console.log('🎉 Leads import completed!');
  } catch (error) {
    console.error('❌ Error importing leads:', error);
  }
}

importLeads();