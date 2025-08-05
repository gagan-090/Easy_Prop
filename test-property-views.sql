-- Test property_views table structure and functionality
-- Run this in your Supabase SQL Editor

-- 1. Check the current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'property_views'
ORDER BY ordinal_position;

-- 2. Check if the table exists and has data
SELECT COUNT(*) as total_records FROM property_views;

-- 3. Try to insert a test record with UUID
INSERT INTO property_views (
    id,
    property_id,
    user_id,
    session_id,
    viewed_at
) VALUES (
    gen_random_uuid(),
    'test_property_id',
    'test_user_id',
    'test_session_id',
    NOW()
);

-- 4. Check if the insert worked
SELECT COUNT(*) as records_after_insert FROM property_views;

-- 5. Clean up test data
DELETE FROM property_views WHERE property_id = 'test_property_id'; 