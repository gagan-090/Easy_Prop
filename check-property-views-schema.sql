-- Check the current schema of property_views table
-- Run this in your Supabase SQL Editor

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'property_views'
ORDER BY ordinal_position;

-- Check if id column is bigint or text
SELECT 
    'id column type:' as info,
    data_type as id_type
FROM information_schema.columns 
WHERE table_name = 'property_views' 
AND column_name = 'id'; 