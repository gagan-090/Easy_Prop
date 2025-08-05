-- Add session_id column to property_views table
-- Run this in your Supabase SQL Editor

-- Add the session_id column if it doesn't exist
ALTER TABLE property_views 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Add index for session_id for better performance
CREATE INDEX IF NOT EXISTS idx_property_views_session_id ON property_views(session_id);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'property_views' 
AND column_name = 'session_id'; 