# SQL to Supabase Migration

This directory contains all the necessary scripts and tools to migrate data from SQL databases to Supabase (PostgreSQL) for the EasyProp platform.

## 📁 Directory Structure

```
migration/
├── data/                          # Directory for exported SQL data
│   ├── sample_users_export.json      # Sample users data structure
│   ├── sample_properties_export.json # Sample properties data structure
│   ├── sample_leads_export.json      # Sample leads data structure
│   ├── sample_revenue_export.json    # Sample revenue data structure
│   └── sample_analytics_export.json  # Sample analytics data structure
├── importUsers.js                 # Import users to Supabase
├── importProperties.js            # Import properties to Supabase
├── importLeads.js                 # Import leads to Supabase
├── importRevenue.js               # Import revenue to Supabase
├── importAnalytics.js             # Import analytics to Supabase
├── supabase-schema.sql            # Database schema for Supabase
├── batchImport.js                 # Run all imports in sequence
├── validateImport.js              # Validate imported data
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Prerequisites

Make sure you have Node.js installed and the following dependencies:

```bash
npm install @supabase/supabase-js dotenv
```

### 2. Environment Setup

Create a `.env` file in the project root with your Supabase configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set up Supabase Database

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase-schema.sql and run in Supabase SQL Editor
```

This will create all the necessary tables, indexes, and Row Level Security policies.

### 4. Export Data from SQL Database

Run the SQL queries provided in `SQL_TO_FIRESTORE_MIGRATION.md` to export your data. Save the results as JSON files in the `migration/data/` directory:

- `users_export.json`
- `properties_export.json`
- `leads_export.json`
- `revenue_export.json`
- `analytics_export.json`

### 5. Run Migration

#### Option A: Batch Import (Recommended)

```bash
cd migration
node batchImport.js
```

#### Option B: Individual Imports

```bash
cd migration
node importUsers.js
node importProperties.js
node importLeads.js
node importRevenue.js
node importAnalytics.js
```

### 6. Validate Import

```bash
cd migration
node validateImport.js
```

## 📊 Data Structure

### Users Table

```javascript
{
  uid: string,
  email: string,
  name: string,
  phone: string,
  stats: {
    totalProperties: number,
    totalLeads: number,
    totalRevenue: number,
    // ... more stats
  },
  preferences: {
    theme: string,
    notifications: boolean,
    // ... more preferences
  },
  subscription: {
    plan: string,
    status: string,
    // ... subscription details
  }
}
```

### Properties Table

```javascript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  type: 'sale' | 'rent',
  price: number,
  location: {
    address: string,
    city: string,
    coordinates: { latitude: number, longitude: number }
  },
  images: string[],
  amenities: string[],
  // ... more property details
}
```

### Leads Table

```javascript
{
  id: string,
  userId: string,
  propertyId: string,
  name: string,
  email: string,
  phone: string,
  status: 'new' | 'contacted' | 'qualified' | 'converted',
  notes: object[],
  communications: object[],
  // ... more lead details
}
```

## 🔧 Configuration

### Supabase Configuration

Update your `.env` file with your Supabase project URL and anon key from your Supabase dashboard.

### Rate Limiting

The batch import script includes delays between imports to avoid Supabase rate limits. Adjust the delay in `batchImport.js` if needed:

```javascript
// Add delay between imports (default: 1000ms)
await new Promise((resolve) => setTimeout(resolve, 1000));
```

### Error Handling

All scripts include comprehensive error handling. Check the console output for any issues during import.

## 📈 Monitoring

### Import Progress

Each script logs progress as it imports data:

```
Imported user: john.doe@example.com
Imported property: Luxury 3BHK Apartment in Bandra
Imported lead: Sarah Johnson - sarah.johnson@example.com
```

### Validation Results

The validation script provides detailed statistics:

```
📊 users: 150 documents
📊 properties: 1250 documents
📊 leads: 500 documents
👥 Total users: 150
🏠 Users with properties: 125
💰 Total revenue: ₹5,000,000
```

## 🚨 Important Notes

### Before Migration

1. **Backup**: Always backup your existing Supabase data
2. **Test Environment**: Run migration on a test Supabase project first
3. **Security Rules**: Update Supabase RLS policies before going live
4. **Indexes**: Create required indexes after import (included in schema)

### Data Validation

- Verify data types are correctly converted
- Check that dates are properly formatted
- Ensure arrays and objects are structured correctly
- Validate that relationships between collections are maintained

### Performance Considerations

- Large datasets may take significant time to import
- Monitor Supabase usage and costs during migration
- Consider batching very large imports across multiple days

## 🔍 Troubleshooting

### Common Issues

#### Permission Denied

```
Error: Missing or insufficient permissions
```

**Solution**: Check Supabase RLS policies and ensure your API key has proper permissions.

#### Rate Limit Exceeded

```
Error: Quota exceeded
```

**Solution**: Increase delays between imports or split large datasets into smaller batches.

#### Invalid Data Format

```
Error: Invalid document data
```

**Solution**: Check that your exported JSON data matches the expected structure in the sample files.

#### Missing Environment Variables

```
Error: Supabase configuration not found
```

**Solution**: Ensure your `.env` file is properly configured with all required Supabase settings.

### Getting Help

1. Check the console output for detailed error messages
2. Verify your Supabase configuration
3. Ensure your exported data matches the sample structure
4. Run the validation script to identify specific issues

## 📝 Sample Data

The `data/` directory contains sample JSON files showing the expected data structure. Use these as templates for your exported SQL data.

## 🎯 Next Steps

After successful migration:

1. Update your application to use Supabase instead of SQL
2. Set up proper Supabase RLS policies
3. Verify indexes are working properly
4. Test all application functionality
5. Monitor performance and costs
6. Set up backup strategies for Supabase

## 📞 Support

For issues specific to this migration process, check:

1. Supabase dashboard for any service issues
2. Supabase usage quotas and limits
3. Network connectivity and permissions
4. Data format and structure validation

Happy migrating! 🚀
