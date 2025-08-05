-- Quick fix: Add company column to users table
-- Run this in Supabase SQL Editor

-- Add company column
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('user_type', 'company');