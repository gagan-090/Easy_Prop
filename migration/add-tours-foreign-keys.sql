-- Add foreign key relationships to tours table
-- Run this SQL in your Supabase SQL Editor to enable proper joins

-- Add foreign key constraint to properties table
ALTER TABLE tours 
ADD CONSTRAINT fk_tours_property_id 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- Add foreign key constraint to users table  
ALTER TABLE tours 
ADD CONSTRAINT fk_tours_property_owner_id 
FOREIGN KEY (property_owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- Test message
SELECT 'Foreign key constraints added to tours table!' as message;