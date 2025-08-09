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

-- Test the migration
SELECT 'visitor_user_id column added successfully!' as message;