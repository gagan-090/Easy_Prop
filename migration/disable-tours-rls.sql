-- Temporarily disable RLS for tours table (for development/testing)
-- Run this SQL in your Supabase SQL Editor to allow tour scheduling without authentication issues

-- Disable Row Level Security for tours table
ALTER TABLE tours DISABLE ROW LEVEL SECURITY;

-- Test message
SELECT 'Tours RLS disabled - tour scheduling should work now!' as message;

-- NOTE: In production, you should re-enable RLS with proper policies
-- To re-enable later, run: ALTER TABLE tours ENABLE ROW LEVEL SECURITY;