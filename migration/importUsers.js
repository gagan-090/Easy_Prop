// importUsers.js
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

async function importUsers() {
  try {
    // Read exported SQL data (assuming JSON format)
    const usersData = JSON.parse(fs.readFileSync('data/users_export.json', 'utf8'));
    
    console.log(`📊 Starting import of ${usersData.length} users...`);
    
    for (const user of usersData) {
      const userData = {
        id: user.uid,
        email: user.email,
        name: user.name,
        phone: user.phone || null,
        photo_url: user.photoURL || null,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        last_login_at: user.lastLoginAt || null,
        
        // Statistics (stored as JSONB)
        stats: {
          total_properties: user.total_properties || 0,
          properties_for_sale: user.properties_for_sale || 0,
          properties_for_rent: user.properties_for_rent || 0,
          total_customers: user.total_customers || 0,
          total_cities: user.total_cities || 0,
          total_revenue: user.total_revenue || 0,
          monthly_revenue: user.monthly_revenue || 0,
          total_leads: user.total_leads || 0,
          active_leads: user.active_leads || 0,
          converted_leads: user.converted_leads || 0
        },
        
        // Preferences (stored as JSONB)
        preferences: {
          theme: user.theme_preference || 'light',
          notifications: user.notifications_enabled !== false,
          email_updates: user.email_updates_enabled !== false,
          language: user.language_preference || 'en',
          timezone: user.timezone || 'UTC'
        },
        
        // Profile (stored as JSONB)
        profile: {
          bio: user.bio || '',
          address: user.address || '',
          website: user.website || '',
          social_media: {
            facebook: user.facebook_url || '',
            twitter: user.twitter_url || '',
            linkedin: user.linkedin_url || '',
            instagram: user.instagram_url || ''
          }
        },
        
        // Account Status
        status: user.status || 'active',
        email_verified: user.emailVerified || false,
        phone_verified: user.phoneVerified || false,
        
        // Subscription (stored as JSONB)
        subscription: {
          plan: user.subscription_plan || 'free',
          status: user.subscription_status || 'active',
          start_date: user.subscription_start_date || new Date().toISOString(),
          end_date: user.subscription_end_date || null,
          features: user.subscription_plan === 'free' ? ['basic_listings'] : ['basic_listings', 'advanced_analytics', 'priority_support']
        }
      };
      
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error importing user ${user.email}:`, error.message);
      } else {
        console.log(`✅ Imported user: ${user.email}`);
      }
    }
    
    console.log('🎉 Users import completed!');
  } catch (error) {
    console.error('❌ Error importing users:', error);
  }
}

importUsers();