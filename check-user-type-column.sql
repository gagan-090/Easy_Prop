-- SQL script to check if user_type column exists and view user data
-- Run this in your Supabase SQL Editor to debug the user type issue

-- 1. Check if user_type column exists
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'user_type';

-- 2. Check the structure of the users table
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. View all users and their user_type (limit to 10 for safety)
SELECT id, email, name, user_type, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Count users by user_type
SELECT user_type, COUNT(*) as count
FROM users
GROUP BY user_type;

-- 5. Check for users without user_type
SELECT id, email, name, user_type
FROM users
WHERE user_type IS NULL
LIMIT 5;