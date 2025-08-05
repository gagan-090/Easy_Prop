# Supabase Row Level Security (RLS) Setup Guide

## Current Issue
The application is getting blocked by Supabase's Row Level Security policies when trying to insert data into the `properties` table.

## Solution Options

### Option 1: Disable RLS for Development (Quick Fix)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project: `xjpjjxlnnxerxmvzvgka`
3. Go to **Authentication** → **Policies**
4. Find the `properties` table
5. Click on the table and disable RLS by toggling the "Enable RLS" switch OFF
6. This will allow all operations without restrictions

### Option 2: Create Proper RLS Policies (Recommended for Production)

#### For the `properties` table:
```sql
-- Allow authenticated users to insert their own properties
CREATE POLICY "Users can insert their own properties" ON properties
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read all properties
CREATE POLICY "Users can view all properties" ON properties
FOR SELECT USING (true);

-- Allow users to update their own properties
CREATE POLICY "Users can update their own properties" ON properties
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own properties
CREATE POLICY "Users can delete their own properties" ON properties
FOR DELETE USING (auth.uid() = user_id);
```

#### For the `users` table:
```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);
```

#### For the `leads` table:
```sql
-- Allow users to insert leads
CREATE POLICY "Users can insert leads" ON leads
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own leads
CREATE POLICY "Users can read their own leads" ON leads
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own leads
CREATE POLICY "Users can update their own leads" ON leads
FOR UPDATE USING (auth.uid() = user_id);
```

#### For the `revenue` table:
```sql
-- Allow users to insert revenue records
CREATE POLICY "Users can insert revenue" ON revenue
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own revenue
CREATE POLICY "Users can read their own revenue" ON revenue
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own revenue
CREATE POLICY "Users can update their own revenue" ON revenue
FOR UPDATE USING (auth.uid() = user_id);
```

## How to Apply These Policies

### Method 1: Using Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Paste the SQL policies above
5. Run the query

### Method 2: Using the Supabase CLI
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref xjpjjxlnnxerxmvzvgka`
4. Create a migration file with the policies
5. Run: `supabase db push`

## Quick Test
After applying the policies, test the connection:

```javascript
// Test in browser console
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://xjpjjxlnnxerxmvzvgka.supabase.co', 'your-anon-key');

// Test insert
const { data, error } = await supabase
  .from('properties')
  .insert([{
    title: 'Test Property',
    price: 100000,
    user_id: 'test-user-id'
  }]);

console.log('Insert result:', { data, error });
```

## Important Notes
- **For Development**: Option 1 (disabling RLS) is the quickest solution
- **For Production**: Use Option 2 with proper policies for security
- Make sure your Supabase client is using the correct API keys
- The `user_id` field in your tables should match the Firebase user ID

## Next Steps
1. Choose either Option 1 or Option 2 above
2. Apply the changes in your Supabase dashboard
3. Test the property addition functionality again
4. If issues persist, check the browser console for more detailed error messages 