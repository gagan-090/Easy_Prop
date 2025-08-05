-- Complete fix for users table structure
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add user_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'user_type') THEN
        ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'agent' CHECK (user_type IN ('agent', 'owner'));
    END IF;
    
    -- Add company column if it doesn't exist (for backward compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'company') THEN
        ALTER TABLE users ADD COLUMN company TEXT;
    END IF;
    
    -- Add other missing columns that might be needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'photo_url') THEN
        ALTER TABLE users ADD COLUMN photo_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
        ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'stats') THEN
        ALTER TABLE users ADD COLUMN stats JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile') THEN
        ALTER TABLE users ADD COLUMN profile JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'subscription') THEN
        ALTER TABLE users ADD COLUMN subscription JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Step 2: Update existing users to have default values
UPDATE users SET user_type = 'agent' WHERE user_type IS NULL;
UPDATE users SET status = 'active' WHERE status IS NULL;
UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
UPDATE users SET phone_verified = FALSE WHERE phone_verified IS NULL;
UPDATE users SET stats = '{"totalProperties": 0, "propertiesForSale": 0, "propertiesForRent": 0, "totalCustomers": 0, "totalCities": 0, "totalRevenue": 0, "monthlyRevenue": 0, "totalLeads": 0, "activeLeads": 0, "convertedLeads": 0}' WHERE stats IS NULL OR stats = '{}';
UPDATE users SET preferences = '{"theme": "light", "notifications": true, "emailUpdates": true}' WHERE preferences IS NULL OR preferences = '{}';
UPDATE users SET profile = '{}' WHERE profile IS NULL;
UPDATE users SET subscription = '{}' WHERE subscription IS NULL;
UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL;

-- Step 3: Show the final table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;