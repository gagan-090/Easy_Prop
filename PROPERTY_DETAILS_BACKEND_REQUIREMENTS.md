# Property Details Page - Backend Requirements

## Overview
This document outlines all the additional database fields and backend enhancements required to make the PropertyDetails page fully dynamic. The current implementation has comprehensive UI sections that need corresponding backend data support.

## Current Database Schema Analysis

### Existing Properties Table Fields
Based on the current schema, we have:
- Basic info: `id`, `title`, `description`, `price`, `area`, `bedrooms`, `bathrooms`
- Location: `address`, `city`, `state`, `country`, `pincode`, `locality`, `latitude`, `longitude`
- Property details: `property_type`, `type` (sale/rent), `category`, `furnishing`, `facing`
- Status: `status`, `availability`, `possession_date`
- Metadata: `created_at`, `updated_at`, `views`, `featured`, `verified`

## Required Additional Fields

### 1. Property Specifications Section

#### Core Property Details
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN built_year INTEGER;
ALTER TABLE properties ADD COLUMN age_of_property INTEGER;
ALTER TABLE properties ADD COLUMN floor INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN total_floors INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN carpet_area INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN built_up_area INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN balconies INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN parking INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN builder TEXT;
ALTER TABLE properties ADD COLUMN project_name TEXT;
ALTER TABLE properties ADD COLUMN rera_id TEXT;
ALTER TABLE properties ADD COLUMN super_area INTEGER DEFAULT 0;
```

#### Property Features & Amenities
```sql
-- Enhanced amenities (JSON array)
ALTER TABLE properties ADD COLUMN amenities JSONB DEFAULT '[]';
ALTER TABLE properties ADD COLUMN safety_features JSONB DEFAULT '[]';
ALTER TABLE properties ADD COLUMN community_features JSONB DEFAULT '[]';

-- Example amenities structure:
-- ["parking", "wifi", "gym", "swimming_pool", "security", "lift", "garden", "club_house", "children_play_area"]
```

### 2. Floor Plans & Media Section

#### Floor Plans Table
```sql
CREATE TABLE IF NOT EXISTS property_floor_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    plan_image_url TEXT NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area INTEGER,
    plan_type TEXT, -- '2bhk', '3bhk', 'penthouse', etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Virtual Tours & Media
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN virtual_tour_url TEXT;
ALTER TABLE properties ADD COLUMN video_tour_url TEXT;
ALTER TABLE properties ADD COLUMN brochure_url TEXT;

-- Property Documents Table
CREATE TABLE IF NOT EXISTS property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'title_deed', 'approved_plan', 'noc', 'completion_certificate'
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Location & Neighborhood Data

#### Nearby Facilities Table
```sql
CREATE TABLE IF NOT EXISTS nearby_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    facility_type TEXT NOT NULL, -- 'hospital', 'school', 'shopping', 'transport', 'restaurant'
    facility_name TEXT NOT NULL,
    distance_km DECIMAL(5,2) NOT NULL,
    travel_time_minutes INTEGER,
    facility_rating DECIMAL(2,1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Transportation Links
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN metro_distance INTEGER; -- in meters
ALTER TABLE properties ADD COLUMN bus_stop_distance INTEGER; -- in meters
ALTER TABLE properties ADD COLUMN railway_distance INTEGER; -- in meters
ALTER TABLE properties ADD COLUMN airport_distance INTEGER; -- in meters

-- Transportation Details Table
CREATE TABLE IF NOT EXISTS transportation_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    transport_type TEXT NOT NULL, -- 'metro', 'bus', 'train', 'airport'
    station_name TEXT NOT NULL,
    distance_meters INTEGER NOT NULL,
    travel_time_minutes INTEGER,
    line_color TEXT, -- for metro lines
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Market Data & Analytics

#### Price History Table
```sql
CREATE TABLE IF NOT EXISTS property_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    price DECIMAL(15,2) NOT NULL,
    price_per_sqft DECIMAL(10,2),
    recorded_date DATE NOT NULL,
    change_reason TEXT, -- 'market_update', 'negotiation', 'renovation'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Market Trends & Area Statistics
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN investment_score DECIMAL(3,1); -- out of 10
ALTER TABLE properties ADD COLUMN rental_yield DECIMAL(5,2); -- percentage
ALTER TABLE properties ADD COLUMN appreciation_rate DECIMAL(5,2); -- percentage

-- Area Statistics Table
CREATE TABLE IF NOT EXISTS area_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    population INTEGER,
    avg_income DECIMAL(12,2),
    growth_rate DECIMAL(5,2),
    livability_score DECIMAL(3,1),
    demand_index TEXT, -- 'high', 'medium', 'low'
    supply_index TEXT, -- 'high', 'medium', 'low'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Legal & Documentation

#### Legal Information
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN legal_status TEXT DEFAULT 'clear'; -- 'clear', 'disputed', 'pending'
ALTER TABLE properties ADD COLUMN bank_loan_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE properties ADD COLUMN rera_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN possession_type TEXT; -- 'ready_to_move', 'under_construction', 'new_launch'

-- Legal Documents Status
CREATE TABLE IF NOT EXISTS legal_documents_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title_deed_status BOOLEAN DEFAULT FALSE,
    approved_plan_status BOOLEAN DEFAULT FALSE,
    noc_status BOOLEAN DEFAULT FALSE,
    completion_certificate_status BOOLEAN DEFAULT FALSE,
    tax_receipt_status BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Financial Information

#### Financing Options
```sql
CREATE TABLE IF NOT EXISTS financing_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    loan_percentage INTEGER, -- max loan percentage
    interest_rate DECIMAL(5,2),
    processing_fee DECIMAL(10,2),
    is_pre_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Government Schemes
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN pmay_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN tax_benefits_applicable BOOLEAN DEFAULT TRUE;
ALTER TABLE properties ADD COLUMN subsidy_amount DECIMAL(10,2) DEFAULT 0;
```

### 7. Future Development Projects

#### Upcoming Projects Table
```sql
CREATE TABLE IF NOT EXISTS future_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    project_type TEXT NOT NULL, -- 'metro', 'mall', 'hospital', 'school', 'park'
    description TEXT,
    completion_date DATE,
    distance_from_property INTEGER, -- in meters
    impact_on_property TEXT, -- 'positive', 'neutral', 'negative'
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 8. Property Reviews & Ratings

#### Property Reviews Table
```sql
CREATE TABLE IF NOT EXISTS property_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_type TEXT, -- 'location', 'builder', 'amenities', 'value_for_money'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 9. Enhanced Property Images

#### Property Images Table (Enhanced)
```sql
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT, -- 'exterior', 'interior', 'amenity', 'floor_plan', 'location'
    room_type TEXT, -- 'living_room', 'bedroom', 'kitchen', 'bathroom', 'balcony'
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. Weather & Environmental Data

#### Environmental Information
```sql
-- Add to properties table
ALTER TABLE properties ADD COLUMN air_quality_index INTEGER;
ALTER TABLE properties ADD COLUMN noise_level TEXT; -- 'low', 'medium', 'high'
ALTER TABLE properties ADD COLUMN green_space_nearby BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN water_supply_hours INTEGER DEFAULT 24;
ALTER TABLE properties ADD COLUMN power_backup BOOLEAN DEFAULT FALSE;
```

## Required Backend API Enhancements

### 1. Enhanced Property Fetching API
```javascript
// GET /api/properties/:id/detailed
// Should return all related data in a single response:
{
  property: { /* basic property data */ },
  floorPlans: [ /* floor plans array */ ],
  nearbyFacilities: [ /* facilities array */ ],
  transportationLinks: [ /* transport links */ ],
  priceHistory: [ /* price history */ ],
  legalDocuments: { /* legal status */ },
  financingOptions: [ /* financing options */ ],
  reviews: [ /* property reviews */ ],
  areaStatistics: { /* area stats */ },
  futureProjects: [ /* upcoming projects */ ]
}
```

### 2. Similar Properties API Enhancement
```javascript
// GET /api/properties/:id/similar
// Enhanced filtering with multiple categories:
{
  priceRange: [ /* properties in similar price range */ ],
  sameLocation: [ /* properties in same locality */ ],
  sameBHK: [ /* properties with same BHK */ ],
  similarSize: [ /* properties with similar area */ ],
  sameBuilder: [ /* properties by same builder */ ],
  nearMetro: [ /* properties near metro */ ]
}
```

### 3. Market Data API
```javascript
// GET /api/market-data/:locality
{
  areaStatistics: { /* population, growth, etc. */ },
  pricetrends: [ /* historical price data */ ],
  demandSupply: { /* market indicators */ },
  futureProjects: [ /* upcoming developments */ ]
}
```

## Database Migration Scripts

### Migration Order
1. Add new columns to existing `properties` table
2. Create new tables (floor_plans, nearby_facilities, etc.)
3. Create indexes for performance
4. Populate sample data for testing

### Sample Migration Script
```sql
-- migration/enhance-property-details.sql

-- Step 1: Add new columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS built_year INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS builder TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS metro_distance INTEGER;
-- ... (add all new columns)

-- Step 2: Create new tables
CREATE TABLE IF NOT EXISTS property_floor_plans (
    -- ... (table definition)
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_builder ON properties(builder);
CREATE INDEX IF NOT EXISTS idx_properties_metro_distance ON properties(metro_distance);
CREATE INDEX IF NOT EXISTS idx_nearby_facilities_property_id ON nearby_facilities(property_id);

-- Step 4: Insert sample data
INSERT INTO area_statistics (locality, city, population, avg_income, growth_rate, livability_score)
VALUES 
('Koramangala', 'Bangalore', 45000, 850000, 12.5, 4.2),
('Bandra', 'Mumbai', 65000, 1200000, 8.3, 4.5);
```

## Frontend Integration Points

### 1. AddProperty Form Enhancements
The `AddProperty` component needs to be enhanced with:
- Floor plan upload section
- Amenities checklist (comprehensive)
- Builder/project information
- Legal document upload
- Nearby facilities input
- Transportation details

### 2. Data Validation
```javascript
// Enhanced validation schema
const propertyValidationSchema = {
  // Basic fields (existing)
  title: { required: true, minLength: 10 },
  price: { required: true, min: 100000 },
  
  // New required fields
  builder: { required: true },
  built_year: { required: true, min: 1950, max: new Date().getFullYear() + 5 },
  rera_id: { required: false, pattern: /^[A-Z0-9]{10,}$/ },
  
  // Arrays
  amenities: { required: true, minItems: 3 },
  floorPlans: { required: false, maxItems: 5 }
};
```

## Implementation Priority

### Phase 1 (High Priority)
1. ✅ Basic property specifications fields
2. ✅ Enhanced amenities and features
3. ✅ Floor plans table and upload
4. ✅ Nearby facilities data

### Phase 2 (Medium Priority)
1. ✅ Price history and market data
2. ✅ Legal documentation status
3. ✅ Transportation links
4. ✅ Future projects data

### Phase 3 (Low Priority)
1. ✅ Property reviews system
2. ✅ Environmental data
3. ✅ Advanced analytics
4. ✅ Weather integration

## Testing Requirements

### Sample Data Population
Create comprehensive sample data for:
- 50+ properties with all fields populated
- Multiple floor plans per property
- Nearby facilities for each locality
- Price history data (6 months)
- Future projects in major cities

### API Testing
- Test all enhanced endpoints
- Verify data relationships
- Performance testing with large datasets
- Mobile responsiveness testing

## Conclusion

This comprehensive backend enhancement will make the PropertyDetails page fully dynamic and provide users with extremely detailed property information. The implementation should be done in phases to ensure stability and proper testing at each stage.

Total estimated development time: 4-6 weeks for complete implementation.