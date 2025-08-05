// importProperties.js
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

async function importProperties() {
  try {
    const propertiesData = JSON.parse(fs.readFileSync('data/properties_export.json', 'utf8'));
    
    console.log(`📊 Starting import of ${propertiesData.length} properties...`);
    
    for (const property of propertiesData) {
      const propertyData = {
        id: property.id,
        user_id: property.userId,
        title: property.title,
        description: property.description || '',
        
        // Property Type & Category
        type: property.type,
        category: property.category,
        property_type: property.propertyType,
        
        // Pricing
        price: property.price || 0,
        currency: property.currency || 'INR',
        price_per_sqft: property.pricePerSqft || 0,
        negotiable: property.negotiable || true,
        
        // Property Details
        area: property.area || 0,
        built_up_area: property.builtUpArea || 0,
        carpet_area: property.carpetArea || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        balconies: property.balconies || 0,
        parking: property.parking || 0,
        floor: property.floor || 0,
        total_floors: property.totalFloors || 0,
        
        // Location
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        country: property.country || 'India',
        pincode: property.pincode || '',
        locality: property.locality || '',
        landmark: property.landmark || '',
        latitude: property.latitude || 0,
        longitude: property.longitude || 0,
        
        // Media (stored as JSONB arrays)
        images: Array.isArray(property.images) ? property.images : [],
        videos: [],
        virtual_tour: '',
        floor_plan: '',
        
        // Features & Amenities (stored as JSONB arrays)
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        features: Array.isArray(property.features) ? property.features : [],
        furnishing: property.furnishing || 'unfurnished',
        
        // Property Status
        status: property.status || 'active',
        availability: property.availability || 'immediate',
        possession_date: property.possessionDate || null,
        
        // Marketing
        featured: property.featured || false,
        premium: property.premium || false,
        verified: property.verified || false,
        
        // Analytics
        views: property.views || 0,
        inquiries: property.inquiries || 0,
        favorites: property.favorites || 0,
        shares: property.shares || 0,
        
        // SEO & Search (stored as JSONB arrays)
        tags: Array.isArray(property.tags) ? property.tags : [],
        keywords: [],
        
        // Timestamps
        created_at: property.createdAt,
        updated_at: property.updatedAt,
        published_at: property.publishedAt || property.createdAt,
        expires_at: property.expiresAt || null,
        
        // Additional Info
        age_of_property: property.ageOfProperty || 0,
        facing: property.facing || 'north',
        source: property.source || 'direct',
        
        // Contact Preferences
        contact_preference: property.contactPreference || 'both',
        best_time_to_call: property.bestTimeToCall || 'anytime'
      };
      
      const { data, error } = await supabase
        .from('properties')
        .upsert(propertyData, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error importing property ${property.title}:`, error.message);
      } else {
        console.log(`✅ Imported property: ${property.title}`);
      }
    }
    
    console.log('🎉 Properties import completed!');
  } catch (error) {
    console.error('❌ Error importing properties:', error);
  }
}

importProperties();