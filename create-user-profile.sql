-- Manual script to create user profile in Supabase
-- Replace 'YOUR_USER_ID' with your actual Firebase user ID
-- Replace 'your-email@example.com' with your actual email

-- First, check if user already exists
SELECT * FROM users WHERE id = 'YOUR_USER_ID';

-- If no results, create the user profile
INSERT INTO users (
    id,
    email,
    name,
    user_type,
    created_at,
    updated_at,
    status,
    email_verified,
    phone_verified,
    stats,
    preferences,
    profile,
    subscription
) VALUES (
    'YOUR_USER_ID',  -- Replace with your Firebase user ID
    'your-email@example.com',  -- Replace with your email
    'Your Name',  -- Replace with your name
    'owner',  -- Set to 'owner' or 'agent'
    NOW(),
    NOW(),
    'active',
    true,
    false,
    '{"totalProperties": 0, "propertiesForSale": 0, "propertiesForRent": 0, "totalCustomers": 0, "totalCities": 0, "totalRevenue": 0, "monthlyRevenue": 0, "totalLeads": 0, "activeLeads": 0, "convertedLeads": 0}',
    '{"theme": "light", "notifications": true, "emailUpdates": true}',
    '{}',
    '{}'
);

-- Verify the user was created
SELECT id, email, name, user_type, created_at FROM users WHERE id = 'YOUR_USER_ID';