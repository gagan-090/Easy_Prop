# Database Setup Instructions

## Required SQL Migrations

To enable the full user profile functionality with tours, you need to run the following SQL commands in your Supabase SQL Editor:

### 1. Create Tours Table (if not already created)

```sql
-- Simple Tours table migration (without complex functions)
-- Run this SQL in your Supabase SQL Editor to add basic tour functionality

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY DEFAULT 'tour_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 9),
    property_id TEXT NOT NULL,
    property_owner_id TEXT NOT NULL,

    -- Visitor Information
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_message TEXT,

    -- Tour Details
    tour_date DATE NOT NULL,
    tour_time TIME NOT NULL,

    -- Status Management
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),

    -- Tour Type
    tour_type TEXT DEFAULT 'physical' CHECK (tour_type IN ('physical', 'virtual', 'both')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_property_id ON tours(property_id);
CREATE INDEX IF NOT EXISTS idx_tours_property_owner_id ON tours(property_owner_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_tour_date ON tours(tour_date);
CREATE INDEX IF NOT EXISTS idx_tours_visitor_email ON tours(visitor_email);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tours
-- Property owners can see tours for their properties
CREATE POLICY "Property owners can view tours for their properties" ON tours
    FOR SELECT USING (auth.uid()::text = property_owner_id);

-- Property owners can update tours for their properties
CREATE POLICY "Property owners can update tours for their properties" ON tours
    FOR UPDATE USING (auth.uid()::text = property_owner_id);

-- Anyone can insert tours (for scheduling)
CREATE POLICY "Anyone can schedule tours" ON tours
    FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER update_tours_updated_at
    BEFORE UPDATE ON tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Add visitor_user_id Column (Required for User Profile)

```sql
-- Add visitor_user_id column to tours table for better user tracking
-- This allows us to link tours to registered users while still supporting anonymous bookings

-- Add the visitor_user_id column
ALTER TABLE tours ADD COLUMN IF NOT EXISTS visitor_user_id TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tours_visitor_user_id ON tours(visitor_user_id);

-- Add RLS policy for users to view their own scheduled tours
CREATE POLICY "Users can view their own scheduled tours" ON tours
    FOR SELECT USING (
        auth.uid()::text = visitor_user_id OR
        auth.email() = visitor_email
    );

-- Update existing RLS policy to allow users to view their tours
DROP POLICY IF EXISTS "Anyone can schedule tours" ON tours;
CREATE POLICY "Anyone can schedule tours" ON tours
    FOR INSERT WITH CHECK (true);
```

### 3. Ensure Favorites Table Exists

```sql
-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    property_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can add to their favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can remove from their favorites" ON favorites
    FOR DELETE USING (auth.uid()::text = user_id);
```

## How to Run These Migrations

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste each SQL block above
4. Run them one by one
5. Verify that the tables and columns are created successfully

## Features Enabled After Migration

- ✅ User Profile Page (`/profile`)
- ✅ User can view their scheduled tours
- ✅ Tour status tracking (pending, confirmed, cancelled, completed)
- ✅ Property owner contact information for confirmed tours
- ✅ Wishlist/Favorites functionality
- ✅ User settings and preferences
- ✅ Tour booking with user ID tracking

## Troubleshooting

If you encounter any errors:

1. **Table already exists**: This is normal, the `IF NOT EXISTS` clause handles this
2. **Policy already exists**: Drop the existing policy first, then create the new one
3. **Column already exists**: This is normal, the `IF NOT EXISTS` clause handles this
4. **Permission denied**: Make sure you're using the service role key or have proper permissions

## Testing

After running the migrations, test the functionality by:

1. Registering a new user
2. Browsing properties and adding some to favorites
3. Scheduling a tour on a property
4. Visiting the user profile page (`/profile`)
5. Checking that tours and favorites are displayed correctly
