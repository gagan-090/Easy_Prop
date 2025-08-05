# Favorites Table Fix

## Problem
The application is getting a `400 (Bad Request)` error: "Could not find a relationship between 'favorites' and 'properties' in the schema cache".

This error occurs because:
1. The application code expects a separate `favorites` table to exist
2. The current database schema only has a `favorites` column in the `properties` table (to track count)
3. There's no foreign key relationship between a non-existent `favorites` table and the `properties` table

## Solution
Create the missing `favorites` table in your Supabase database.

### Steps to Fix:

1. **Run the SQL migration** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of create-favorites-table.sql
   ```

2. **The migration will create:**
   - A `favorites` table with proper foreign key relationships
   - Indexes for better performance
   - Row Level Security (RLS) policies
   - A database trigger to automatically update the favorites count on properties

3. **The trigger will:**
   - Automatically increment the `favorites` count when a user favorites a property
   - Automatically decrement the `favorites` count when a user removes a favorite

### What the migration does:
- Creates a `favorites` table with `user_id` and `property_id` columns
- Establishes foreign key relationships to both `users` and `properties` tables
- Ensures each user can only favorite a property once (unique constraint)
- Sets up RLS policies so users can only see their own favorites
- Creates a trigger to keep the `properties.favorites` count in sync

### After running the migration:
- The `getUserFavorites` function will work correctly
- Users can add/remove favorites without errors
- The favorites count on properties will be automatically maintained

## Files Modified:
- `create-favorites-table.sql` - New migration file
- `src/services/supabaseService.js` - Simplified `addToFavorites` and `removeFromFavorites` functions (removed manual count updates since the trigger handles it)

## Testing:
After applying the migration, test the favorites functionality in your application to ensure:
1. Users can add properties to favorites
2. Users can remove properties from favorites  
3. The favorites count on properties updates correctly
4. Users can view their list of favorited properties 