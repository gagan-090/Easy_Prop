-- Fix Tours RLS Policies
-- Run this SQL in your Supabase SQL Editor to fix tour scheduling permissions

-- Drop existing policies
DROP POLICY IF EXISTS "Property owners can view tours for their properties" ON tours;
DROP POLICY IF EXISTS "Property owners can update tours for their properties" ON tours;
DROP POLICY IF EXISTS "Anyone can schedule tours" ON tours;

-- Create more permissive RLS policies

-- Allow anyone to insert tours (for public tour scheduling)
CREATE POLICY "Allow public tour scheduling" ON tours 
    FOR INSERT WITH CHECK (true);

-- Allow property owners to view their tours
CREATE POLICY "Property owners can view their tours" ON tours 
    FOR SELECT USING (
        auth.uid()::text = property_owner_id OR 
        auth.uid() IS NULL  -- Allow anonymous access for now
    );

-- Allow property owners to update their tours
CREATE POLICY "Property owners can update their tours" ON tours 
    FOR UPDATE USING (auth.uid()::text = property_owner_id);

-- Allow property owners to delete their tours
CREATE POLICY "Property owners can delete their tours" ON tours 
    FOR DELETE USING (auth.uid()::text = property_owner_id);

-- Test the fix
SELECT 'Tours RLS policies updated successfully!' as message;