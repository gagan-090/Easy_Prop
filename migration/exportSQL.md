# SQL Export Queries

This document contains the SQL queries needed to export data from your existing database for migration to Firestore.

## Prerequisites

1. Access to your SQL database (MySQL, PostgreSQL, etc.)
2. Database client or command line access
3. Permission to export data

## Export Instructions

### Step 1: Export Users Data

```sql
-- Export Users Data
SELECT 
    u.id as uid,
    u.email,
    u.first_name || ' ' || u.last_name as name,
    u.phone,
    u.profile_picture_url as photoURL,
    u.created_at as createdAt,
    u.updated_at as updatedAt,
    u.last_login_at as lastLoginAt,
    u.status,
    u.email_verified as emailVerified,
    u.phone_verified as phoneVerified,
    u.bio,
    u.address,
    u.website,
    u.facebook_url,
    u.twitter_url,
    u.linkedin_url,
    u.instagram_url,
    u.theme_preference,
    u.notifications_enabled,
    u.email_updates_enabled,
    u.language_preference,
    u.timezone,
    u.subscription_plan,
    u.subscription_status,
    u.subscription_start_date,
    u.subscription_end_date,
    -- Calculate statistics
    COALESCE(p.total_properties, 0) as total_properties,
    COALESCE(p.properties_for_sale, 0) as properties_for_sale,
    COALESCE(p.properties_for_rent, 0) as properties_for_rent,
    COALESCE(c.total_customers, 0) as total_customers,
    COALESCE(ct.total_cities, 0) as total_cities,
    COALESCE(r.total_revenue, 0) as total_revenue,
    COALESCE(r.monthly_revenue, 0) as monthly_revenue,
    COALESCE(l.total_leads, 0) as total_leads,
    COALESCE(l.active_leads, 0) as active_leads,
    COALESCE(l.converted_leads, 0) as converted_leads
FROM users u
LEFT JOIN (
    -- Property statistics
    SELECT 
        user_id,
        COUNT(*) as total_properties,
        COUNT(CASE WHEN type = 'sale' THEN 1 END) as properties_for_sale,
        COUNT(CASE WHEN type = 'rent' THEN 1 END) as properties_for_rent
    FROM properties 
    WHERE status != 'deleted'
    GROUP BY user_id
) p ON u.id = p.user_id
LEFT JOIN (
    -- Customer statistics
    SELECT 
        user_id,
        COUNT(DISTINCT email) as total_customers
    FROM leads 
    WHERE status != 'deleted'
    GROUP BY user_id
) c ON u.id = c.user_id
LEFT JOIN (
    -- City statistics
    SELECT 
        user_id,
        COUNT(DISTINCT city) as total_cities
    FROM properties 
    WHERE status != 'deleted' AND city IS NOT NULL
    GROUP BY user_id
) ct ON u.id = ct.user_id
LEFT JOIN (
    -- Revenue statistics
    SELECT 
        user_id,
        SUM(amount) as total_revenue,
        SUM(CASE 
            WHEN EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            THEN amount ELSE 0 
        END) as monthly_revenue
    FROM revenue 
    WHERE status = 'completed'
    GROUP BY user_id
) r ON u.id = r.user_id
LEFT JOIN (
    -- Lead statistics
    SELECT 
        user_id,
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status IN ('new', 'contacted', 'qualified') THEN 1 END) as active_leads,
        COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads
    FROM leads 
    WHERE status != 'deleted'
    GROUP BY user_id
) l ON u.id = l.user_id
WHERE u.status = 'active'
ORDER BY u.created_at DESC;
```

**Save as:** `migration/data/users_export.json`

### Step 2: Export Properties Data

```sql
-- Export Properties Data
SELECT 
    p.id,
    p.user_id as userId,
    p.title,
    p.description,
    p.type,
    p.category,
    p.property_type as propertyType,
    p.price,
    p.currency,
    p.price_per_sqft as pricePerSqft,
    p.negotiable,
    p.area,
    p.built_up_area as builtUpArea,
    p.carpet_area as carpetArea,
    p.bedrooms,
    p.bathrooms,
    p.balconies,
    p.parking,
    p.floor,
    p.total_floors as totalFloors,
    p.address,
    p.city,
    p.state,
    p.country,
    p.pincode,
    p.locality,
    p.landmark,
    p.latitude,
    p.longitude,
    p.furnishing,
    p.status,
    p.availability,
    p.possession_date as possessionDate,
    p.featured,
    p.premium,
    p.verified,
    p.views,
    p.inquiries,
    p.favorites,
    p.shares,
    p.age_of_property as ageOfProperty,
    p.facing,
    p.source,
    p.contact_preference as contactPreference,
    p.best_time_to_call as bestTimeToCall,
    p.created_at as createdAt,
    p.updated_at as updatedAt,
    p.published_at as publishedAt,
    p.expires_at as expiresAt,
    -- Images as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pi.image_url IS NOT NULL 
            THEN pi.image_url 
            END
        ), 
        JSON_ARRAY()
    ) as images,
    -- Amenities as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pa.amenity_name IS NOT NULL 
            THEN pa.amenity_name 
            END
        ), 
        JSON_ARRAY()
    ) as amenities,
    -- Features as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pf.feature_name IS NOT NULL 
            THEN pf.feature_name 
            END
        ), 
        JSON_ARRAY()
    ) as features,
    -- Tags as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN pt.tag_name IS NOT NULL 
            THEN pt.tag_name 
            END
        ), 
        JSON_ARRAY()
    ) as tags
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN property_amenities pa ON p.id = pa.property_id
LEFT JOIN property_features pf ON p.id = pf.property_id
LEFT JOIN property_tags pt ON p.id = pt.property_id
WHERE p.status != 'deleted'
GROUP BY p.id, p.user_id, p.title, p.description, p.type, p.category, 
         p.property_type, p.price, p.currency, p.price_per_sqft, p.negotiable,
         p.area, p.built_up_area, p.carpet_area, p.bedrooms, p.bathrooms,
         p.balconies, p.parking, p.floor, p.total_floors, p.address,
         p.city, p.state, p.country, p.pincode, p.locality, p.landmark,
         p.latitude, p.longitude, p.furnishing, p.status, p.availability,
         p.possession_date, p.featured, p.premium, p.verified, p.views,
         p.inquiries, p.favorites, p.shares, p.age_of_property, p.facing,
         p.source, p.contact_preference, p.best_time_to_call, p.created_at,
         p.updated_at, p.published_at, p.expires_at
ORDER BY p.created_at DESC;
```

**Save as:** `migration/data/properties_export.json`

### Step 3: Export Leads Data

```sql
-- Export Leads Data
SELECT 
    l.id,
    l.user_id as userId,
    l.property_id as propertyId,
    l.name,
    l.email,
    l.phone,
    l.message,
    l.budget,
    l.requirements,
    l.status,
    l.priority,
    l.source,
    l.contact_method as contactMethod,
    l.preferred_time as preferredTime,
    l.score,
    l.rating,
    l.last_contact_at as lastContactAt,
    l.next_follow_up as nextFollowUp,
    l.follow_up_count as followUpCount,
    l.location,
    l.occupation,
    l.company,
    l.created_at as createdAt,
    l.updated_at as updatedAt,
    l.converted_at as convertedAt,
    l.conversion_value as conversionValue,
    -- Notes as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN ln.note IS NOT NULL 
            THEN JSON_OBJECT(
                'id', ln.id,
                'note', ln.note,
                'created_at', ln.created_at,
                'created_by', ln.created_by
            )
            END
        ), 
        JSON_ARRAY()
    ) as notes,
    -- Communication history as JSON array
    COALESCE(
        JSON_ARRAYAGG(
            CASE WHEN lc.id IS NOT NULL 
            THEN JSON_OBJECT(
                'id', lc.id,
                'type', lc.type,
                'date', lc.created_at,
                'subject', lc.subject,
                'content', lc.content,
                'status', lc.status
            )
            END
        ), 
        JSON_ARRAY()
    ) as communications
FROM leads l
LEFT JOIN lead_notes ln ON l.id = ln.lead_id
LEFT JOIN lead_communications lc ON l.id = lc.lead_id
WHERE l.status != 'deleted'
GROUP BY l.id, l.user_id, l.property_id, l.name, l.email, l.phone,
         l.message, l.budget, l.requirements, l.status, l.priority,
         l.source, l.contact_method, l.preferred_time, l.score, l.rating,
         l.last_contact_at, l.next_follow_up, l.follow_up_count,
         l.location, l.occupation, l.company, l.created_at, l.updated_at,
         l.converted_at, l.conversion_value
ORDER BY l.created_at DESC;
```

**Save as:** `migration/data/leads_export.json`

### Step 4: Export Revenue Data

```sql
-- Export Revenue Data
SELECT 
    r.id,
    r.user_id as userId,
    r.property_id as propertyId,
    r.lead_id as leadId,
    r.amount,
    r.currency,
    r.type,
    r.transaction_id as transactionId,
    r.payment_method as paymentMethod,
    r.payment_status as paymentStatus,
    r.created_at as createdAt,
    r.received_at as receivedAt,
    r.due_date as dueDate,
    r.description,
    r.category,
    r.recurring,
    r.tax_amount as taxAmount,
    r.tax_rate as taxRate,
    r.net_amount as netAmount,
    r.client_name as clientName,
    r.client_email as clientEmail,
    r.client_phone as clientPhone
FROM revenue r
WHERE r.status != 'deleted'
ORDER BY r.created_at DESC;
```

**Save as:** `migration/data/revenue_export.json`

### Step 5: Export Analytics Data

```sql
-- Export Analytics Data (Daily Aggregated)
SELECT 
    DATE(a.created_at) as date,
    a.user_id as userId,
    SUM(a.total_views) as total_views,
    SUM(a.unique_views) as unique_views,
    SUM(a.total_leads) as total_leads,
    SUM(a.new_leads) as new_leads,
    SUM(a.converted_leads) as converted_leads,
    SUM(a.total_revenue) as total_revenue,
    COUNT(a.transactions) as transactions,
    AVG(a.average_transaction) as average_transaction,
    SUM(a.active_properties) as active_properties,
    SUM(a.sold_properties) as sold_properties,
    SUM(a.rented_properties) as rented_properties,
    SUM(a.new_properties) as new_properties,
    SUM(a.login_count) as logins,
    SUM(a.time_spent_minutes) as time_spent,
    SUM(a.direct_traffic) as direct_traffic,
    SUM(a.search_traffic) as search_traffic,
    SUM(a.social_traffic) as social_traffic,
    SUM(a.referral_traffic) as referral_traffic
FROM analytics a
WHERE a.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
GROUP BY DATE(a.created_at), a.user_id
ORDER BY date DESC, a.user_id;
```

**Save as:** `migration/data/analytics_export.json`

## Export Methods

### Method 1: Database Client (Recommended)

1. **MySQL Workbench / phpMyAdmin:**
   - Run each query
   - Export results as JSON
   - Save to the specified filename

2. **PostgreSQL (pgAdmin):**
   - Execute queries
   - Export as JSON format
   - Save with correct filename

3. **Command Line:**
   ```bash
   # MySQL
   mysql -u username -p database_name -e "SELECT ..." --batch --raw | jq '.' > users_export.json
   
   # PostgreSQL
   psql -d database_name -c "SELECT ..." -t -A -F',' | jq '.' > users_export.json
   ```

### Method 2: Custom Export Script

Create a script in your preferred language (PHP, Python, Node.js) to:
1. Connect to your database
2. Execute each query
3. Convert results to JSON
4. Save to the migration/data/ directory

### Method 3: Database Tools

Use database-specific tools:
- **MySQL**: `mysqldump` with JSON format
- **PostgreSQL**: `pg_dump` with custom format
- **SQL Server**: SQL Server Management Studio export wizard

## Data Validation

After exporting, validate your JSON files:

1. **Check file sizes** - Empty files indicate export issues
2. **Validate JSON format** - Use online JSON validators
3. **Verify data structure** - Compare with sample files
4. **Check relationships** - Ensure foreign keys are preserved

## Common Issues

### Large Datasets
- Export in batches if you have millions of records
- Use LIMIT and OFFSET for pagination
- Consider exporting by date ranges

### Special Characters
- Ensure proper UTF-8 encoding
- Handle NULL values appropriately
- Escape special characters in JSON

### Performance
- Add indexes on frequently queried columns
- Run exports during low-traffic periods
- Monitor database performance during export

## Next Steps

After exporting all data:

1. Place JSON files in `migration/data/` directory
2. Run `npm run setup` to verify files
3. Execute `npm run migrate` to start migration
4. Validate with `npm run validate`

## Support

If you encounter issues with SQL queries:
1. Adjust column names to match your database schema
2. Modify JOIN conditions based on your relationships
3. Update data types and formats as needed
4. Test queries on a small dataset first