-- Quick fix: Add user_type column to users table
-- Copy and paste this into Supabase SQL Editor and click Run

-- Step 1: Add the column
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'agent';

-- Step 2: Add the constraint
ALTER TABLE users ADD CONSTRAINT user_type_check CHECK (user_type IN ('agent', 'owner'));

-- Step 3: Update existing users to have default user_type
UPDATE users SET user_type = 'agent' WHERE user_type IS NULL;

-- Step 4: Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'user_type';