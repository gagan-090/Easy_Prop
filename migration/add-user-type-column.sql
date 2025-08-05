-- Migration script to add user_type column to existing users table
-- Run this SQL in your Supabase SQL Editor after updating the schema

-- Add user_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'user_type') THEN
        ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'agent' CHECK (user_type IN ('agent', 'owner'));
    END IF;
END $$;

-- Update existing users to have default user_type as 'agent'
UPDATE users 
SET user_type = 'agent' 
WHERE user_type IS NULL;

-- Add comment to the column
COMMENT ON COLUMN users.user_type IS 'User role: agent or owner';