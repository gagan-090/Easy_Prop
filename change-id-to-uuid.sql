-- Change property_views id column to UUID type
-- WARNING: This will delete all existing view data
-- Run this in your Supabase SQL Editor

-- Drop the existing table (this will delete all view data)
DROP TABLE IF EXISTS property_views CASCADE;

-- Recreate the table with UUID id column
CREATE TABLE property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate views from same user
    UNIQUE(property_id, user_id),
    
    -- Index for performance
    CONSTRAINT idx_property_views_property_user UNIQUE(property_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_session_id ON property_views(session_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'property_views'
ORDER BY ordinal_position; 