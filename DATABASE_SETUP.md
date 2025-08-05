# EasyProp Firestore Database Setup Guide

## Overview

This guide provides comprehensive instructions for setting up the Firestore database structure for the EasyProp real estate platform. All data is user-specific and isolated for security and privacy.

## Database Architecture

### Collections Structure

```
easyprop-firestore/
├── users/                    # User profiles and settings
├── properties/               # Property listings
├── leads/                    # Customer inquiries and leads
├── revenue/                  # Revenue tracking
├── analytics/                # Analytics data
├── notifications/            # User notifications
├── settings/                 # App-wide settings
└── subscriptions/            # User subscription data
```

## Collection Schemas

### 1. Users Collection (`users`)

**Document ID**: User UID from Firebase Auth

```javascript
{
  // Basic Information
  uid: "string",                    // Firebase Auth UID
  email: "string",                  // User email
  name: "string",                   // Full name
  phone: "string",                  // Phone number (optional)
  photoURL: "string",               // Profile picture URL (optional)

  // Timestamps
  createdAt: "timestamp",           // Account creation date
  updatedAt: "timestamp",           // Last profile update
  lastLoginAt: "timestamp",         // Last login time

  // Statistics (auto-calculated)
  stats: {
    totalProperties: 0,             // Total properties added
    propertiesForSale: 0,           // Properties for sale
    propertiesForRent: 0,           // Properties for rent
    totalCustomers: 0,              // Total unique customers
    totalCities: 0,                 // Cities with properties
    totalRevenue: 0,                // Total revenue earned
    monthlyRevenue: 0,              // Current month revenue
    totalLeads: 0,                  // Total leads received
    activeLeads: 0,                 // Currently active leads
    convertedLeads: 0               // Successfully converted leads
  },

  // User Preferences
  preferences: {
    theme: "light",                 // UI theme: "light" | "dark" | "system"
    notifications: true,            // Email notifications enabled
    emailUpdates: true,             // Marketing emails enabled
    language: "en",                 // Preferred language
    timezone: "UTC"                 // User timezone
  },

  // Profile Details
  profile: {
    bio: "string",                  // User bio/description
    address: "string",              // Business address
    website: "string",              // Website URL
    socialMedia: {
      facebook: "string",
      twitter: "string",
      linkedin: "string",
      instagram: "string"
    }
  },

  // Account Status
  status: "active",                 // "active" | "suspended" | "deleted"
  emailVerified: false,             // Email verification status
  phoneVerified: false,             // Phone verification status

  // Subscription Info
  subscription: {
    plan: "free",                   // "free" | "basic" | "pro" | "enterprise"
    status: "active",               // "active" | "cancelled" | "expired"
    startDate: "timestamp",
    endDate: "timestamp",
    features: []                    // Array of enabled features
  }
}
```

### 2. Properties Collection (`properties`)

**Document ID**: Auto-generated

```javascript
{
  // Basic Information
  id: "string",                     // Auto-generated document ID
  userId: "string",                 // Owner's user ID
  title: "string",                  // Property title
  description: "string",            // Detailed description

  // Property Type & Category
  type: "sale",                     // "sale" | "rent" | "lease"
  category: "residential",          // "residential" | "commercial" | "industrial" | "land"
  propertyType: "apartment",        // "apartment" | "villa" | "house" | "office" | "shop" | "warehouse"

  // Pricing
  price: 0,                         // Property price in currency
  currency: "INR",                  // Currency code
  pricePerSqft: 0,                  // Price per square foot
  negotiable: true,                 // Price negotiable flag

  // Property Details
  area: 0,                          // Total area in sq ft
  builtUpArea: 0,                   // Built-up area in sq ft
  carpetArea: 0,                    // Carpet area in sq ft
  bedrooms: 0,                      // Number of bedrooms
  bathrooms: 0,                     // Number of bathrooms
  balconies: 0,                     // Number of balconies
  parking: 0,                       // Number of parking spaces
  floor: 0,                         // Floor number
  totalFloors: 0,                   // Total floors in building

  // Location
  address: "string",                // Full address
  city: "string",                   // City name
  state: "string",                  // State name
  country: "India",                 // Country
  pincode: "string",                // Postal code
  locality: "string",               // Locality/area name
  landmark: "string",               // Nearby landmark
  coordinates: {
    latitude: 0,                    // GPS latitude
    longitude: 0                    // GPS longitude
  },

  // Media
  images: [],                       // Array of image URLs
  videos: [],                       // Array of video URLs
  virtualTour: "string",            // Virtual tour URL
  floorPlan: "string",              // Floor plan image URL

  // Features & Amenities
  amenities: [],                    // Array of amenities
  features: [],                     // Array of special features
  furnishing: "unfurnished",        // "furnished" | "semi-furnished" | "unfurnished"

  // Property Status
  status: "active",                 // "active" | "sold" | "rented" | "inactive" | "pending"
  availability: "immediate",        // "immediate" | "under-construction" | "ready-to-move"
  possessionDate: "timestamp",      // Expected possession date

  // Marketing
  featured: false,                  // Featured listing flag
  premium: false,                   // Premium listing flag
  verified: false,                  // Verification status

  // Analytics
  views: 0,                         // Total views
  inquiries: 0,                     // Total inquiries
  favorites: 0,                     // Times favorited
  shares: 0,                        // Times shared

  // SEO & Search
  tags: [],                         // Search tags
  keywords: [],                     // SEO keywords

  // Timestamps
  createdAt: "timestamp",           // Creation date
  updatedAt: "timestamp",           // Last update
  publishedAt: "timestamp",         // Publication date
  expiresAt: "timestamp",           // Listing expiry date

  // Additional Info
  ageOfProperty: 0,                 // Age in years
  facing: "north",                  // Direction facing
  source: "direct",                 // "direct" | "broker" | "builder"

  // Legal
  approvals: [],                    // Legal approvals
  documents: [],                    // Document URLs

  // Contact Preferences
  contactPreference: "both",        // "phone" | "email" | "both"
  bestTimeToCall: "anytime"         // Preferred contact time
}
```

### 3. Leads Collection (`leads`)

**Document ID**: Auto-generated

```javascript
{
  // Basic Information
  id: "string",                     // Auto-generated document ID
  userId: "string",                 // Property owner's user ID
  propertyId: "string",             // Related property ID

  // Lead Information
  name: "string",                   // Lead's name
  email: "string",                  // Lead's email
  phone: "string",                  // Lead's phone

  // Inquiry Details
  message: "string",                // Inquiry message
  budget: "string",                 // Budget range
  requirements: "string",           // Specific requirements

  // Lead Classification
  status: "new",                    // "new" | "contacted" | "qualified" | "converted" | "closed" | "ignored"
  priority: "medium",               // "low" | "medium" | "high" | "urgent"
  source: "website",                // "website" | "referral" | "social" | "advertisement" | "direct"

  // Contact Information
  contactMethod: "email",           // "email" | "phone" | "whatsapp" | "chat"
  preferredTime: "anytime",         // Preferred contact time

  // Lead Scoring
  score: 0,                         // Lead score (0-100)
  rating: 0,                        // Lead rating (1-5 stars)

  // Follow-up
  lastContactAt: "timestamp",       // Last contact date
  nextFollowUp: "timestamp",        // Next follow-up date
  followUpCount: 0,                 // Number of follow-ups

  // Additional Details
  location: "string",               // Lead's location
  occupation: "string",             // Lead's occupation
  company: "string",                // Company name

  // Timestamps
  createdAt: "timestamp",           // Lead creation date
  updatedAt: "timestamp",           // Last update

  // Notes & History
  notes: [],                        // Array of notes
  history: [],                      // Activity history

  // Conversion Tracking
  convertedAt: "timestamp",         // Conversion date
  conversionValue: 0,               // Deal value

  // Communication Log
  communications: [
    {
      type: "email",                // "email" | "phone" | "meeting" | "whatsapp"
      date: "timestamp",
      subject: "string",
      content: "string",
      status: "sent"                // "sent" | "delivered" | "read" | "replied"
    }
  ]
}
```

### 4. Revenue Collection (`revenue`)

**Document ID**: Auto-generated

```javascript
{
  // Basic Information
  id: "string",                     // Auto-generated document ID
  userId: "string",                 // User ID
  propertyId: "string",             // Related property ID (optional)
  leadId: "string",                 // Related lead ID (optional)

  // Revenue Details
  amount: 0,                        // Revenue amount
  currency: "INR",                  // Currency code
  type: "commission",               // "commission" | "rent" | "sale" | "subscription" | "other"

  // Transaction Details
  transactionId: "string",          // Transaction reference
  paymentMethod: "bank_transfer",   // Payment method
  paymentStatus: "completed",       // "pending" | "completed" | "failed" | "refunded"

  // Dates
  createdAt: "timestamp",           // Revenue record creation
  receivedAt: "timestamp",          // Payment received date
  dueDate: "timestamp",             // Payment due date

  // Additional Info
  description: "string",            // Revenue description
  category: "primary",              // "primary" | "secondary"
  recurring: false,                 // Recurring revenue flag

  // Tax Information
  taxAmount: 0,                     // Tax amount
  taxRate: 0,                       // Tax rate percentage
  netAmount: 0,                     // Amount after tax

  // Client Information
  clientName: "string",             // Client name
  clientEmail: "string",            // Client email
  clientPhone: "string"             // Client phone
}
```

### 5. Analytics Collection (`analytics`)

**Document ID**: Date-based (YYYY-MM-DD)

```javascript
{
  // Date Information
  date: "string",                   // Date in YYYY-MM-DD format
  userId: "string",                 // User ID

  // Daily Metrics
  views: {
    total: 0,                       // Total views
    unique: 0,                      // Unique views
    properties: {}                  // Per-property views
  },

  // Lead Metrics
  leads: {
    total: 0,                       // Total leads
    new: 0,                         // New leads
    converted: 0,                   // Converted leads
    sources: {}                     // Leads by source
  },

  // Revenue Metrics
  revenue: {
    total: 0,                       // Total revenue
    transactions: 0,                // Number of transactions
    average: 0                      // Average transaction value
  },

  // Property Metrics
  properties: {
    active: 0,                      // Active properties
    sold: 0,                        // Properties sold
    rented: 0,                      // Properties rented
    new: 0                          // New properties added
  },

  // User Activity
  activity: {
    logins: 0,                      // Login count
    timeSpent: 0,                   // Time spent in minutes
    actions: {}                     // Actions performed
  },

  // Traffic Sources
  traffic: {
    direct: 0,                      // Direct traffic
    search: 0,                      // Search engine traffic
    social: 0,                      // Social media traffic
    referral: 0                     // Referral traffic
  }
}
```

### 6. Notifications Collection (`notifications`)

**Document ID**: Auto-generated

```javascript
{
  // Basic Information
  id: "string",                     // Auto-generated document ID
  userId: "string",                 // Recipient user ID

  // Notification Content
  title: "string",                  // Notification title
  message: "string",                // Notification message
  type: "info",                     // "info" | "success" | "warning" | "error"

  // Notification Category
  category: "lead",                 // "lead" | "property" | "revenue" | "system" | "marketing"

  // Status
  read: false,                      // Read status
  archived: false,                  // Archived status

  // Related Data
  relatedId: "string",              // Related document ID
  relatedType: "lead",              // Related document type

  // Action
  actionUrl: "string",              // Action URL (optional)
  actionText: "string",             // Action button text

  // Timestamps
  createdAt: "timestamp",           // Creation date
  readAt: "timestamp",              // Read date
  expiresAt: "timestamp"            // Expiry date
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Properties belong to specific users
    match /properties/{propertyId} {
      allow read: if true; // Public read for property listings
      allow write: if request.auth != null &&
        (resource == null || request.auth.uid == resource.data.userId);
    }

    // Leads belong to property owners
    match /leads/{leadId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Revenue records are private
    match /revenue/{revenueId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Analytics are private
    match /analytics/{analyticsId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Notifications are private
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Database Indexes

### Composite Indexes Required

```javascript
// Properties Collection
{
  collection: "properties",
  fields: [
    { field: "userId", order: "ASCENDING" },
    { field: "status", order: "ASCENDING" },
    { field: "createdAt", order: "DESCENDING" }
  ]
}

{
  collection: "properties",
  fields: [
    { field: "city", order: "ASCENDING" },
    { field: "type", order: "ASCENDING" },
    { field: "price", order: "ASCENDING" }
  ]
}

// Leads Collection
{
  collection: "leads",
  fields: [
    { field: "userId", order: "ASCENDING" },
    { field: "status", order: "ASCENDING" },
    { field: "createdAt", order: "DESCENDING" }
  ]
}

// Revenue Collection
{
  collection: "revenue",
  fields: [
    { field: "userId", order: "ASCENDING" },
    { field: "createdAt", order: "DESCENDING" }
  ]
}

// Analytics Collection
{
  collection: "analytics",
  fields: [
    { field: "userId", order: "ASCENDING" },
    { field: "date", order: "DESCENDING" }
  ]
}
```

## Data Migration Scripts

### Initial User Setup

```javascript
// Function to create initial user profile
export const initializeUserProfile = async (userId, userData) => {
  const userRef = doc(db, "users", userId);
  const initialProfile = {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    stats: {
      totalProperties: 0,
      propertiesForSale: 0,
      propertiesForRent: 0,
      totalCustomers: 0,
      totalCities: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalLeads: 0,
      activeLeads: 0,
      convertedLeads: 0,
    },
    preferences: {
      theme: "light",
      notifications: true,
      emailUpdates: true,
      language: "en",
      timezone: "UTC",
    },
    status: "active",
    subscription: {
      plan: "free",
      status: "active",
      startDate: serverTimestamp(),
      features: ["basic_listings", "lead_management"],
    },
  };

  await setDoc(userRef, initialProfile);
};
```

### Sample Data Seeding

```javascript
// Function to seed sample data for testing
export const seedSampleData = async (userId) => {
  // Add sample properties
  const sampleProperties = [
    {
      title: "Modern 3BHK Apartment",
      type: "sale",
      category: "residential",
      price: 5000000,
      city: "Mumbai",
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      status: "active",
    },
    // Add more sample data...
  ];

  for (const property of sampleProperties) {
    await addProperty(userId, property);
  }
};
```

## Backup and Recovery

### Automated Backups

```javascript
// Cloud Function for daily backups
exports.scheduledFirestoreBackup = functions.pubsub
  .schedule("0 2 * * *") // Daily at 2 AM
  .onRun(async (context) => {
    const client = new v1.FirestoreAdminClient();
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, "(default)");

    return client.exportDocuments({
      name: databaseName,
      outputUriPrefix: `gs://${projectId}-firestore-backups`,
      collectionIds: ["users", "properties", "leads", "revenue", "analytics"],
    });
  });
```

## Performance Optimization

### Query Optimization Tips

1. **Use Composite Indexes**: Create indexes for common query patterns
2. **Limit Results**: Always use `.limit()` for large collections
3. **Pagination**: Implement cursor-based pagination for better performance
4. **Denormalization**: Store frequently accessed data together
5. **Batch Operations**: Use batch writes for multiple operations

### Caching Strategy

```javascript
// Implement caching for frequently accessed data
const cache = new Map();

export const getCachedUserStats = async (userId) => {
  const cacheKey = `user_stats_${userId}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const stats = await getDashboardStats(userId);
  cache.set(cacheKey, stats);

  // Cache for 5 minutes
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);

  return stats;
};
```

## Monitoring and Analytics

### Performance Monitoring

```javascript
// Monitor query performance
export const monitorQuery = (queryName, queryFunction) => {
  return async (...args) => {
    const startTime = Date.now();

    try {
      const result = await queryFunction(...args);
      const duration = Date.now() - startTime;

      console.log(`Query ${queryName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`Query ${queryName} failed:`, error);
      throw error;
    }
  };
};
```

## Deployment Checklist

- [ ] Set up Firebase project
- [ ] Configure Firestore database
- [ ] Deploy security rules
- [ ] Create composite indexes
- [ ] Set up backup schedule
- [ ] Configure monitoring
- [ ] Test all CRUD operations
- [ ] Verify user isolation
- [ ] Performance testing
- [ ] Security audit

## Maintenance

### Regular Tasks

1. **Weekly**: Review query performance metrics
2. **Monthly**: Analyze storage usage and costs
3. **Quarterly**: Security rules audit
4. **Yearly**: Data retention policy review

### Scaling Considerations

- Monitor read/write operations
- Implement data archiving for old records
- Consider regional deployment for global users
- Plan for collection group queries if needed

This database setup provides a robust, scalable foundation for the EasyProp platform with proper user isolation, security, and performance optimization.
