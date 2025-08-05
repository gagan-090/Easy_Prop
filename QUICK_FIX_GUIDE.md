# Quick Fix Guide: Disable RLS for Development

## Current Issue
Your application is being blocked by Supabase Row Level Security (RLS) policies. The error messages show:
- `new row violates row-level security policy for table "users"`
- `insert or update on table "properties" violates foreign key constraint "properties_user_id_fkey"`

## Solution: Disable RLS (Development Only)

### Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: `xjpjjxlnnxerxmvzvgka`

### Step 2: Open SQL Editor
1. In the left sidebar, click on **SQL Editor**
2. Click **New Query** to create a new SQL query

### Step 3: Run the Disable RLS Script
1. Copy and paste the entire content from `disable-rls-for-development.sql` into the SQL editor
2. Click **Run** to execute the script

### Step 4: Verify the Changes
After running the script, you should see a table showing that `rowsecurity` is `false` for all tables.

### Step 5: Test Your Application
1. Go back to your React application
2. Try adding a property again
3. The property should now be added successfully

## Alternative: Disable RLS via Dashboard UI

If you prefer using the UI instead of SQL:

1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. For each table (`users`, `properties`, `leads`, `revenue`, `analytics`):
   - Click on the table name
   - Toggle the **"Enable RLS"** switch to **OFF**
   - Click **Save**

## What This Does
- **Disables RLS**: Removes all security restrictions on your tables
- **Allows All Operations**: Your application can now read, write, update, and delete data
- **Development Only**: This is NOT recommended for production

## For Production (Later)
When you're ready for production, you should:
1. Re-enable RLS on all tables
2. Create proper security policies
3. Use the policies provided in `SUPABASE_RLS_SETUP.md`

## Test After Fix
Run this command to verify everything works:
```bash
node test-supabase-connection.js
```

You should see:
- ✅ Test user created successfully
- ✅ Insert successful (RLS might be disabled)
- 📊 Inserted property: [property data]

## Next Steps
1. Follow the steps above to disable RLS
2. Test your application
3. Let me know if you encounter any issues 