-- Disable RLS for Development (Quick Fix)
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE revenue DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'properties', 'leads', 'revenue', 'analytics');

-- Optional: Drop existing policies if you want to clean up
-- DROP POLICY IF EXISTS "Users can view own data" ON users;
-- DROP POLICY IF EXISTS "Users can update own data" ON users;
-- DROP POLICY IF EXISTS "Users can view own properties" ON properties;
-- DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
-- DROP POLICY IF EXISTS "Users can update own properties" ON properties;
-- DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
-- DROP POLICY IF EXISTS "Users can view own leads" ON leads;
-- DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
-- DROP POLICY IF EXISTS "Users can update own leads" ON leads;
-- DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
-- DROP POLICY IF EXISTS "Users can view own revenue" ON revenue;
-- DROP POLICY IF EXISTS "Users can insert own revenue" ON revenue;
-- DROP POLICY IF EXISTS "Users can update own revenue" ON revenue;
-- DROP POLICY IF EXISTS "Users can view own analytics" ON analytics;
-- DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics;
-- DROP POLICY IF EXISTS "Users can update own analytics" ON analytics; 