# Troubleshooting User Type Implementation

## Current Issue
The dashboard is showing "Agent" for all users instead of displaying the correct user type (Owner/Agent) based on their registration choice.

## What We've Implemented

### ✅ Code Changes Made
1. **Database Schema**: Added `user_type` column to users table
2. **Registration Form**: Added dropdown for Agent/Owner selection
3. **AuthContext**: Enhanced to fetch and set user type from Supabase
4. **Dashboard**: Added user type display and customized stats
5. **Debug Tools**: Added comprehensive debugging components

### 🔧 Debug Tools Added
1. **UserTypeDebug Component**: Shows current user data and allows manual user type updates
2. **Console Logging**: Added detailed logs throughout the authentication flow
3. **Utility Functions**: Created helper functions for user type management

## How to Debug the Issue

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Look for these debug messages:
   - `🔍 Fetching user profile for: [user-id]`
   - `📊 Profile result: [result]`
   - `✅ User type set from Supabase: [type]`
   - `👤 Final user data: [data]`

### Step 2: Use the Debug Component
1. The dashboard now shows a yellow debug box at the top
2. Check what user type is displayed
3. Use the "Set as Owner" or "Set as Agent" buttons to manually update
4. Click "Refresh User Data" to reload from database

### Step 3: Check Database
Run this SQL in your Supabase SQL Editor:
```sql
-- Check if user_type column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'user_type';

-- Check your user data
SELECT id, email, name, user_type, created_at
FROM users
WHERE email = 'your-email@example.com';
```

### Step 4: Run Database Migration
If the user_type column doesn't exist, run:
```sql
-- Add user_type column
ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'agent' CHECK (user_type IN ('agent', 'owner'));

-- Update existing users
UPDATE users SET user_type = 'agent' WHERE user_type IS NULL;
```

## Common Issues and Solutions

### Issue 1: Database Column Missing
**Symptoms**: Console shows database errors
**Solution**: Run the migration script in `migration/add-user-type-column.sql`

### Issue 2: User Profile Not Found
**Symptoms**: Console shows "User profile not found, creating default profile"
**Solution**: This is normal for existing users. They'll get 'agent' as default.

### Issue 3: User Type Not Updating
**Symptoms**: Debug component shows "Not set" or wrong type
**Solutions**:
1. Use the debug component buttons to manually set the type
2. Check if the database update was successful
3. Try logging out and logging back in

### Issue 4: Dashboard Not Reflecting Changes
**Symptoms**: User type updates but dashboard stats don't change
**Solution**: The dashboard should automatically update. Try refreshing the page.

## Expected Behavior

### For New Users (Registration)
1. User selects "Agent" or "Owner" during registration
2. User type is saved to database
3. Dashboard shows appropriate stats and user type badge

### For Existing Users (Login)
1. User logs in with existing account
2. System checks Supabase for user profile
3. If profile exists: loads user_type from database
4. If profile doesn't exist: creates profile with 'agent' as default
5. Dashboard displays user type and customized stats

### Dashboard Differences
- **Agent**: "Properties for Sale", "Properties for Rent", "Total Customers", "Total Cities"
- **Owner**: "My Properties for Sale", "My Properties for Rent", "Total Inquiries", "Property Views"

## Testing Steps

1. **Test New Registration**:
   - Register a new account
   - Select "Owner" in the dropdown
   - Check if dashboard shows owner-specific stats

2. **Test Existing User**:
   - Login with existing account
   - Check debug component for user type
   - Use manual update buttons if needed

3. **Test Dashboard Customization**:
   - Verify stats titles change based on user type
   - Check user type badge in profile sections

## Files to Check

### Debug Information
- Browser Console (F12 → Console)
- `src/components/UserTypeDebug.jsx` (temporary debug component)

### Database
- Supabase SQL Editor
- Users table structure and data

### Code Files
- `src/contexts/AuthContext.jsx` (authentication logic)
- `src/services/supabaseService.js` (database operations)
- `src/components/DashboardStats.jsx` (dashboard stats)
- `src/layouts/DashboardLayout.jsx` (user type display)

## Next Steps

1. **Check Console Logs**: Look for the debug messages to understand data flow
2. **Use Debug Component**: Test manual user type updates
3. **Verify Database**: Ensure user_type column exists and has correct data
4. **Test Registration**: Create a new account and select "Owner"
5. **Remove Debug Code**: Once working, remove the UserTypeDebug component

## Contact for Help

If the issue persists after following these steps, provide:
1. Screenshots of the debug component
2. Console log messages
3. Database query results
4. Steps you've already tried

The implementation is solid - the issue is likely in the database setup or data flow, which these debugging tools will help identify.