# SQL to Supabase Migration Guide

## Overview
This guide provides SQL queries to export data from traditional SQL databases and import them into Supabase (PostgreSQL) for the EasyProp platform.

## Migration Strategy

### Step 1: Export Data from SQL Database
### Step 2: Transform Data Format
### Step 3: Import to Supabase

---

## SQL Export Queries

### 1. Users Table Export

```sql
-- Export Users Data
SELECT 
    u.id as uid,
    u.email,
    u.first_name || ' ' || u.last_name as name,
    u.phone,
    u.profile_picture_url as photoURL,
    u.created_at as createdAt,
    u.updated_at as updatedAt,
    u.last_login_at as lastLoginAt,
    u.status,
    u.email_verified as emailVerified,
    u.phone_verified as phoneVerified,
    u.bio,
    u.address,
    u.website,
    u.facebook_url,
    u.twitter_url,
    u.linkedin_url,
    u.instagram_url,
    u.theme_preference,
    u.notifications_enabled,
    u.email_updates_enabled,
    u.language_preference,
    u.timezone,
    u.subscription_plan,
    u.subscription_status,
    u.subscription_start_date,
    u.subscription_end_date,
    -- Calculate statistics
    COALESCE(p.total_properties, 0) as total_properties,
    COALESCE(p.properties_for_sale, 0) as properties_for_sale,
    COALESCE(p.properties_for_rent, 0) as properties_for_rent,
    COALESCE(c.total_customers, 0) as total_customers,
    COALESCE(ct.total_cities, 0) as total_cities,
    COALESCE(r.total_revenue, 0) as total_revenue,
    COALESCE(r.monthly_revenue, 0) as monthly_revenue,
    COALESCE(l.total_leads, 0) as total_leads,
    COALESCE(l.active_leads, 0) as active_leads,
    COALESCE(l.converted_leads, 0) as converted_leads
FROM users u
LEFT JOIN (
    -- Property statistics
    SELECT 
        user_id,
        COUNT(*) as total_properties,
        COUNT(CASE WHEN type = 'sale' THEN 1 END) as properties_for_sale,
        COUNT(CASE WHEN type = 'rent' THEN 1 END) as properties_for_rent
    FROM properties 
    WHERE status != 'deleted'
    GROUP BY user_id
) p ON u.id = p.user_id
LEFT JOIN (
    -- Customer statistics
    SELECT 
        user_id,
        COUNT(DISTINCT email) as total_customers
    FROM leads 
    WHERE status != 'deleted'
    GROUP BY user_id
) c ON u.id = c.user_id
LEFT JOIN (
    -- City statistics
    SELECT 
        user_id,
        COUNT(DISTINCT city) as total_cities
    FROM properties 
    WHERE status != 'deleted' AND city IS NOT NULL
    GROUP BY user_id
) ct ON u.id = ct.user_id
LEFT JOIN (
    -- Revenue statistics
    SELECT 
        user_id,
        SUM(amount) as total_revenue,
        SUM(CASE 
            WHEN EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            THEN amount ELSE 0 
        END) as monthly_revenue
    FROM revenue 
    WHERE status = 'completed'
    GROUP BY user_id
) r ON u.id = r.user_id
LEFT JOIN (
    -- Lead statistics
    SELECT 
        user_id,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status IN ('new', 'contacted', 'qualified') THEN 1 END) as active_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads
    FROM leads 
    WHERE status != 'deleted'
    GROUP BY user_id
) l ON u.id = l.user_id
WHERE u.status = 'active'
ORDER BY u.created_at DESC;
```

### 2. Properties Table Export

```sql
-- Export Properties Data
SELECT 
    p.id,
    p.user_id as userId,
    p.title,
    p.description,
    p.type,
    p.category,
    p.property_type as propertyType,
    p.price,
    p.currency,
    p.price_per_sqft as pricePerSqft,
    p.negotiable,
    p.area,
    p.built_up_area as builtUpArea,
    p.carpet_area as carpetArea,
    p.bedrooms,
    p.bathrooms,
    p.balconies,
    p.parking,
    p.floor,
    p.total_floors as totalFloors,
    p.address,
    p.city,
    p.state,
    p.country,
    p.pincode,
    p.locality,
    p.landmark,
    p.latitude,
    p.longitude,
    p.furnishing,
    p.status,
    p.availability,
    p.possession_date as possessionDate,
    p.featured,
    p.premium,
    p.verified,
    p.views,
    p.inquiries,
    p.favorites,
    p.shares,
    p.age_of_property as ageOfProperty,
    p.facing,
    p.source,
    p.contact_preference as contactPreference,
    p.best_time_to_call as bestTimeToCall,
    p.created_at as createdAt,
    p.updated_at as updatedAt,
    p.published_at as publishedAt,
    p.expires_at as expiresAt,
    -- Images as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pi.image_url IS NOT NULL 
            THEN pi.image_url 
            END
        ), 
        JSON_ARRAY()
    ) as images,
    -- Amenities as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pa.amenity_name IS NOT NULL 
            THEN pa.amenity_name 
            END
        ), 
        JSON_ARRAY()
    ) as amenities,
    -- Features as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pf.feature_name IS NOT NULL 
            THEN pf.feature_name 
            END
        ), 
        JSON_ARRAY()
    ) as features,
    -- Tags as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pt.tag_name IS NOT NULL 
            THEN pt.tag_name 
            END
        ), 
        JSON_ARRAY()
    ) as tags
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN property_amenities pa ON p.id = pa.property_id
LEFT JOIN property_features pf ON p.id = pf.property_id
LEFT JOIN property_tags pt ON p.id = pt.property_id
WHERE p.status != 'deleted'
GROUP BY p.id, p.user_id, p.title, p.description, p.type, p.category, 
         p.property_type, p.price, p.currency, p.price_per_sqft, p.negotiable,
         p.area, p.built_up_area, p.carpet_area, p.bedrooms, p.bathrooms,
         p.balconies, p.parking, p.floor, p.total_floors, p.address,
         p.city, p.state, p.country, p.pincode, p.locality, p.landmark,
         p.latitude, p.longitude, p.furnishing, p.status, p.availability,
         p.possession_date, p.featured, p.premium, p.verified, p.views,
         p.inquiries, p.favorites, p.shares, p.age_of_property, p.facing,
         p.source, p.contact_preference, p.best_time_to_call, p.created_at,
         p.updated_at, p.published_at, p.expires_at
ORDER BY p.created_at DESC;
```

### 3. Leads Table Export

```sql
-- Export Leads Data
SELECT 
    l.id,
    l.user_id as userId,
    l.property_id as propertyId,
    l.name,
    l.email,
    l.phone,
    l.message,
    l.budget,
    l.requirements,
    l.status,
    l.priority,
    l.source,
    l.contact_method as contactMethod,
    l.preferred_time as preferredTime,
    l.score,
    l.rating,
    l.last_contact_at as lastContactAt,
    l.next_follow_up as nextFollowUp,
    l.follow_up_count as followUpCount,
    l.location,
    l.occupation,
    l.company,
    l.created_at as createdAt,
    l.updated_at as updatedAt,
    l.converted_at as convertedAt,
    l.conversion_value as conversionValue,
    -- Notes as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN ln.note IS NOT NULL 
            THEN JSON_OBJECT(
                'id', ln.id,
                'note', ln.note,
                'created_at', ln.created_at,
                'created_by', ln.created_by
            )
            END
        ), 
        JSON_ARRAY()
    ) as notes,
    -- Communication history as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN lc.id IS NOT NULL 
            THEN JSON_OBJECT(
                'id', lc.id,
                'type', lc.type,
                'date', lc.created_at,
                'subject', lc.subject,
                'content', lc.content,
                'status', lc.status
            )
            END
        ), 
        JSON_ARRAY()
    ) as communications
FROM leads l
LEFT JOIN lead_notes ln ON l.id = ln.lead_id
LEFT JOIN lead_communications lc ON l.id = lc.lead_id
WHERE l.status != 'deleted'
GROUP BY l.id, l.user_id, l.property_id, l.name, l.email, l.phone,
         l.message, l.budget, l.requirements, l.status, l.priority,
         l.source, l.contact_method, l.preferred_time, l.score, l.rating,
         l.last_contact_at, l.next_follow_up, l.follow_up_count,
         l.location, l.occupation, l.company, l.created_at, l.updated_at,
         l.converted_at, l.conversion_value
ORDER BY l.created_at DESC;
```

### 4. Revenue Table Export

```sql
-- Export Revenue Data
SELECT 
    r.id,
    r.user_id as userId,
    r.property_id as propertyId,
    r.lead_id as leadId,
    r.amount,
    r.currency,
    r.type,
    r.transaction_id as transactionId,
    r.payment_method as paymentMethod,
    r.payment_status as paymentStatus,
    r.created_at as createdAt,
    r.received_at as receivedAt,
    r.due_date as dueDate,
    r.description,
    r.category,
    r.recurring,
    r.tax_amount as taxAmount,
    r.tax_rate as taxRate,
    r.net_amount as netAmount,
    r.client_name as clientName,
    r.client_email as clientEmail,
    r.client_phone as clientPhone
FROM revenue r
WHERE r.status != 'deleted'
ORDER BY r.created_at DESC;
```

### 5. Analytics Table Export

```sql
-- Export Analytics Data (Daily Aggregated)
SELECT 
    DATE(a.created_at) as date,
    a.user_id as userId,
    SUM(a.total_views) as total_views,
    SUM(a.unique_views) as unique_views,
    SUM(a.total_leads) as total_leads,
    SUM(a.new_leads) as new_leads,
    SUM(a.converted_leads) as converted_leads,
    SUM(a.total_revenue) as total_revenue,
    COUNT(a.transactions) as transactions,
    AVG(a.average_transaction) as average_transaction,
    SUM(a.active_properties) as active_properties,
    SUM(a.sold_properties) as sold_properties,
    SUM(a.rented_properties) as rented_properties,
    SUM(a.new_properties) as new_properties,
    SUM(a.login_count) as logins,
    SUM(a.time_spent_minutes) as time_spent,
    SUM(a.direct_traffic) as direct_traffic,
    SUM(a.search_traffic) as search_traffic,
    SUM(a.social_traffic) as social_traffic,
    SUM(a.referral_traffic) as referral_traffic
FROM analytics a
WHERE a.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
GROUP BY DATE(a.created_at), a.user_id
ORDER BY date DESC, a.user_id;
```

### 6. Notifications Table Export

```sql
-- Export Notifications Data
SELECT 
    n.id,
    n.user_id as userId,
    n.title,
    n.message,
    n.type,
    n.category,
    n.read_status as read,
    n.archived,
    n.related_id as relatedId,
    n.related_type as relatedType,
    n.action_url as actionUrl,
    n.action_text as actionText,
    n.created_at as createdAt,
    n.read_at as readAt,
    n.expires_at as expiresAt
FROM notifications n
WHERE n.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTHS)
ORDER BY n.created_at DESC;
```

---

## Firestore Import Scripts

### 1. Import Users to Firestore

```javascript
// importUsers.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importUsers() {
  try {
    // Read exported SQL data (assuming CSV format)
    const usersData = JSON.parse(fs.readFileSync('users_export.json', 'utf8'));
    
    for (const user of usersData) {
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: user.name,
        phone: user.phone || null,
        photoURL: user.photoURL || null,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
        
        // Statistics
        stats: {
          totalProperties: user.total_properties || 0,
          propertiesForSale: user.properties_for_sale || 0,
          propertiesForRent: user.properties_for_rent || 0,
          totalCustomers: user.total_customers || 0,
          totalCities: user.total_cities || 0,
          totalRevenue: user.total_revenue || 0,
          monthlyRevenue: user.monthly_revenue || 0,
          totalLeads: user.total_leads || 0,
          activeLeads: user.active_leads || 0,
          convertedLeads: user.converted_leads || 0
        },
        
        // Preferences
        preferences: {
          theme: user.theme_preference || 'light',
          notifications: user.notifications_enabled !== false,
          emailUpdates: user.email_updates_enabled !== false,
          language: user.language_preference || 'en',
          timezone: user.timezone || 'UTC'
        },
        
        // Profile
        profile: {
          bio: user.bio || '',
          address: user.address || '',
          website: user.website || '',
          socialMedia: {
            facebook: user.facebook_url || '',
            twitter: user.twitter_url || '',
            linkedin: user.linkedin_url || '',
            instagram: user.instagram_url || ''
          }
        },
        
        // Account Status
        status: user.status || 'active',
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        
        // Subscription
        subscription: {
          plan: user.subscription_plan || 'free',
          status: user.subscription_status || 'active',
          startDate: user.subscription_start_date ? new Date(user.subscription_start_date) : serverTimestamp(),
          endDate: user.subscription_end_date ? new Date(user.subscription_end_date) : null,
          features: user.subscription_plan === 'free' ? ['basic_listings'] : ['basic_listings', 'advanced_analytics', 'priority_support']
        }
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc);
      console.log(`Imported user: ${user.email}`);
    }
    
    console.log('Users import completed!');
  } catch (error) {
    console.error('Error importing users:', error);
  }
}

importUsers();
```

### 2. Import Properties to Firestore

```javascript
// importProperties.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importProperties() {
  try {
    const propertiesData = JSON.parse(fs.readFileSync('properties_export.json', 'utf8'));
    
    for (const property of propertiesData) {
      const propertyDoc = {
        id: property.id,
        userId: property.userId,
        title: property.title,
        description: property.description || '',
        
        // Property Type & Category
        type: property.type,
        category: property.category,
        propertyType: property.propertyType,
        
        // Pricing
        price: property.price || 0,
        currency: property.currency || 'INR',
        pricePerSqft: property.pricePerSqft || 0,
        negotiable: property.negotiable || true,
        
        // Property Details
        area: property.area || 0,
        builtUpArea: property.builtUpArea || 0,
        carpetArea: property.carpetArea || 0,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        balconies: property.balconies || 0,
        parking: property.parking || 0,
        floor: property.floor || 0,
        totalFloors: property.totalFloors || 0,
        
        // Location
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        country: property.country || 'India',
        pincode: property.pincode || '',
        locality: property.locality || '',
        landmark: property.landmark || '',
        coordinates: {
          latitude: property.latitude || 0,
          longitude: property.longitude || 0
        },
        
        // Media
        images: Array.isArray(property.images) ? property.images : [],
        videos: [],
        virtualTour: '',
        floorPlan: '',
        
        // Features & Amenities
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        features: Array.isArray(property.features) ? property.features : [],
        furnishing: property.furnishing || 'unfurnished',
        
        // Property Status
        status: property.status || 'active',
        availability: property.availability || 'immediate',
        possessionDate: property.possessionDate ? new Date(property.possessionDate) : null,
        
        // Marketing
        featured: property.featured || false,
        premium: property.premium || false,
        verified: property.verified || false,
        
        // Analytics
        views: property.views || 0,
        inquiries: property.inquiries || 0,
        favorites: property.favorites || 0,
        shares: property.shares || 0,
        
        // SEO & Search
        tags: Array.isArray(property.tags) ? property.tags : [],
        keywords: [],
        
        // Timestamps
        createdAt: new Date(property.createdAt),
        updatedAt: new Date(property.updatedAt),
        publishedAt: property.publishedAt ? new Date(property.publishedAt) : new Date(property.createdAt),
        expiresAt: property.expiresAt ? new Date(property.expiresAt) : null,
        
        // Additional Info
        ageOfProperty: property.ageOfProperty || 0,
        facing: property.facing || 'north',
        source: property.source || 'direct',
        
        // Contact Preferences
        contactPreference: property.contactPreference || 'both',
        bestTimeToCall: property.bestTimeToCall || 'anytime'
      };
      
      await setDoc(doc(db, 'properties', property.id), propertyDoc);
      console.log(`Imported property: ${property.title}`);
    }
    
    console.log('Properties import completed!');
  } catch (error) {
    console.error('Error importing properties:', error);
  }
}

importProperties();
```

### 3. Import Leads to Firestore

```javascript
// importLeads.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importLeads() {
  try {
    const leadsData = JSON.parse(fs.readFileSync('leads_export.json', 'utf8'));
    
    for (const lead of leadsData) {
      const leadDoc = {
        id: lead.id,
        userId: lead.userId,
        propertyId: lead.propertyId,
        
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
        contactMethod: lead.contactMethod || 'email',
        preferredTime: lead.preferredTime || 'anytime',
        
        // Lead Scoring
        score: lead.score || 0,
        rating: lead.rating || 0,
        
        // Follow-up
        lastContactAt: lead.lastContactAt ? new Date(lead.lastContactAt) : null,
        nextFollowUp: lead.nextFollowUp ? new Date(lead.nextFollowUp) : null,
        followUpCount: lead.followUpCount || 0,
        
        // Additional Details
        location: lead.location || '',
        occupation: lead.occupation || '',
        company: lead.company || '',
        
        // Timestamps
        createdAt: new Date(lead.createdAt),
        updatedAt: new Date(lead.updatedAt),
        
        // Notes & History
        notes: Array.isArray(lead.notes) ? lead.notes : [],
        history: [],
        
        // Conversion Tracking
        convertedAt: lead.convertedAt ? new Date(lead.convertedAt) : null,
        conversionValue: lead.conversionValue || 0,
        
        // Communication Log
        communications: Array.isArray(lead.communications) ? lead.communications : []
      };
      
      await setDoc(doc(db, 'leads', lead.id), leadDoc);
      console.log(`Imported lead: ${lead.name} - ${lead.email}`);
    }
    
    console.log('Leads import completed!');
  } catch (error) {
    console.error('Error importing leads:', error);
  }
}

importLeads();
```

### 4. Import Revenue to Firestore

```javascript
// importRevenue.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importRevenue() {
  try {
    const revenueData = JSON.parse(fs.readFileSync('revenue_export.json', 'utf8'));
    
    for (const revenue of revenueData) {
      const revenueDoc = {
        id: revenue.id,
        userId: revenue.userId,
        propertyId: revenue.propertyId || null,
        leadId: revenue.leadId || null,
        
        // Revenue Details
        amount: revenue.amount || 0,
        currency: revenue.currency || 'INR',
        type: revenue.type || 'commission',
        
        // Transaction Details
        transactionId: revenue.transactionId || '',
        paymentMethod: revenue.paymentMethod || 'bank_transfer',
        paymentStatus: revenue.paymentStatus || 'completed',
        
        // Dates
        createdAt: new Date(revenue.createdAt),
        receivedAt: revenue.receivedAt ? new Date(revenue.receivedAt) : new Date(revenue.createdAt),
        dueDate: revenue.dueDate ? new Date(revenue.dueDate) : null,
        
        // Additional Info
        description: revenue.description || '',
        category: revenue.category || 'primary',
        recurring: revenue.recurring || false,
        
        // Tax Information
        taxAmount: revenue.taxAmount || 0,
        taxRate: revenue.taxRate || 0,
        netAmount: revenue.netAmount || revenue.amount,
        
        // Client Information
        clientName: revenue.clientName || '',
        clientEmail: revenue.clientEmail || '',
        clientPhone: revenue.clientPhone || ''
      };
      
      await setDoc(doc(db, 'revenue', revenue.id), revenueDoc);
      console.log(`Imported revenue: ${revenue.amount} ${revenue.currency}`);
    }
    
    console.log('Revenue import completed!');
  } catch (error) {
    console.error('Error importing revenue:', error);
  }
}

importRevenue();
```

### 5. Import Analytics to Firestore

```javascript
// importAnalytics.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function importAnalytics() {
  try {
    const analyticsData = JSON.parse(fs.readFileSync('analytics_export.json', 'utf8'));
    
    for (const analytics of analyticsData) {
      const analyticsDoc = {
        date: analytics.date,
        userId: analytics.userId,
        
        // Daily Metrics
        views: {
          total: analytics.total_views || 0,
          unique: analytics.unique_views || 0,
          properties: {}
        },
        
        // Lead Metrics
        leads: {
          total: analytics.total_leads || 0,
          new: analytics.new_leads || 0,
          converted: analytics.converted_leads || 0,
          sources: {}
        },
        
        // Revenue Metrics
        revenue: {
          total: analytics.total_revenue || 0,
          transactions: analytics.transactions || 0,
          average: analytics.average_transaction || 0
        },
        
        // Property Metrics
        properties: {
          active: analytics.active_properties || 0,
          sold: analytics.sold_properties || 0,
          rented: analytics.rented_properties || 0,
          new: analytics.new_properties || 0
        },
        
        // User Activity
        activity: {
          logins: analytics.logins || 0,
          timeSpent: analytics.time_spent || 0,
          actions: {}
        },
        
        // Traffic Sources
        traffic: {
          direct: analytics.direct_traffic || 0,
          search: analytics.search_traffic || 0,
          social: analytics.social_traffic || 0,
          referral: analytics.referral_traffic || 0
        }
      };
      
      const docId = `${analytics.userId}_${analytics.date}`;
      await setDoc(doc(db, 'analytics', docId), analyticsDoc);
      console.log(`Imported analytics: ${analytics.date} for user ${analytics.userId}`);
    }
    
    console.log('Analytics import completed!');
  } catch (error) {
    console.error('Error importing analytics:', error);
  }
}

importAnalytics();
```

---

## Batch Import Script

```javascript
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
  
  for (const script of scripts) {
    try {
      console.log(`Running: ${script}`);
      const { stdout, stderr } = await execAsync(script);
      console.log(stdout);
      if (stderr) console.error(stderr);
    } catch (error) {
      console.error(`Error running ${script}:`, error);
    }
  }
  
  console.log('Batch import completed!');
}

runBatchImport();
```

---

## Data Validation Script

```javascript
// validateImport.js - Validate imported data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function validateImport() {
  try {
    // Count documents in each collection
    const collections = ['users', 'properties', 'leads', 'revenue', 'analytics'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`${collectionName}: ${snapshot.size} documents`);
    }
    
    // Validate user stats
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let totalUsers = 0;
    let usersWithProperties = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      totalUsers++;
      const userData = userDoc.data();
      
      if (userData.stats?.totalProperties > 0) {
        usersWithProperties++;
      }
    }
    
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with properties: ${usersWithProperties}`);
    
    console.log('Validation completed!');
  } catch (error) {
    console.error('Error validating import:', error);
  }
}

validateImport();
```

---

## Usage Instructions

### 1. Export Data from SQL Database
```bash
# Run SQL queries in your database management tool
# Export results as JSON files:
# - users_export.json
# - properties_export.json
# - leads_export.json
# - revenue_export.json
# - analytics_export.json
```

### 2. Install Dependencies
```bash
npm install firebase
```

### 3. Configure Firebase
Update the `firebaseConfig` object in each import script with your Firebase project configuration.

### 4. Run Import Scripts
```bash
# Import all data
node batchImport.js

# Or import individually
node importUsers.js
node importProperties.js
node importLeads.js
node importRevenue.js
node importAnalytics.js
```

### 5. Validate Import
```bash
node validateImport.js
```

---

## Important Notes

1. **Backup First**: Always backup your existing data before migration
2. **Test Environment**: Run migration on a test Firebase project first
3. **Rate Limits**: Firestore has write limits, add delays for large datasets
4. **Data Types**: Ensure proper data type conversion (dates, numbers, arrays)
5. **Security Rules**: Update Firestore security rules before going live
6. **Indexes**: Create required composite indexes after import

This migration guide provides a complete solution for moving from SQL databases to Firestore while maintaining data integrity and structure.