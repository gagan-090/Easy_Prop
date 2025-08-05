-- Fix property_views table - Add all missing columns
-- Run this in your Supabase SQL Editor

-- Add all missing columns to property_views table
ALTER TABLE property_views 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_views_session_id ON property_views(session_id);
CREATE INDEX IF NOT EXISTS idx_property_views_ip_address ON property_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);

-- Verify all columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'property_views'
ORDER BY ordinal_position;

-- Check if the table structure matches our expected schema
SELECT 
    'property_views table structure:' as info,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'property_views'; 