# Tours Table Setup Instructions

The tour scheduling functionality requires a `tours` table in your Supabase database. Currently, this table doesn't exist, which is causing the 404 error when trying to schedule tours.

## Quick Setup (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Migration**
   - Copy the entire contents of `migration/add-tours-table.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

## What the Migration Creates

The migration will create:
- `tours` table - Main table for storing tour requests
- `tour_availability` table - For agents to set available time slots
- `tour_notifications` table - For tracking email/SMS notifications
- Indexes for better performance
- Row Level Security (RLS) policies
- Helper functions for tour management

## Verify Setup

After running the migration, you can verify it worked by:

1. **Check Tables**
   - Go to "Table Editor" in Supabase
   - You should see `tours`, `tour_availability`, and `tour_notifications` tables

2. **Test Tour Scheduling**
   - Try scheduling a tour from your application
   - It should work without the 404 error

## Alternative: Manual Table Creation

If you prefer a minimal setup, you can create just the basic tours table:

```sql
CREATE TABLE tours (
    id TEXT PRIMARY KEY DEFAULT 'tour_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 9),
    property_id TEXT NOT NULL,
    property_owner_id TEXT NOT NULL,
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_message TEXT,
    tour_date DATE NOT NULL,
    tour_time TIME NOT NULL,
    status TEXT DEFAULT 'pending',
    tour_type TEXT DEFAULT 'physical',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert tours (for scheduling)
CREATE POLICY "Anyone can schedule tours" ON tours 
    FOR INSERT WITH CHECK (true);

-- Property owners can view tours for their properties
CREATE POLICY "Property owners can view tours" ON tours 
    FOR SELECT USING (auth.uid()::text = property_owner_id);
```

## Current Status

- ✅ Tour scheduling form is working
- ❌ Tours table is missing (causing 404 error)
- ✅ Error handling is in place (shows user-friendly message)

After setting up the tours table, the tour scheduling functionality will work completely.