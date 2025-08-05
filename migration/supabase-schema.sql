-- Supabase Schema for EasyProp Migration
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    user_type TEXT DEFAULT 'agent' CHECK (user_type IN ('agent', 'owner')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Account Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- JSON fields for complex data
    stats JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    profile JSONB DEFAULT '{}',
    subscription JSONB DEFAULT '{}'
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Property Type & Category
    type TEXT NOT NULL CHECK (type IN ('sale', 'rent')),
    category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'industrial')),
    property_type TEXT NOT NULL,
    
    -- Pricing
    price DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    price_per_sqft DECIMAL(10,2) DEFAULT 0,
    negotiable BOOLEAN DEFAULT TRUE,
    
    -- Property Details
    area INTEGER DEFAULT 0,
    built_up_area INTEGER DEFAULT 0,
    carpet_area INTEGER DEFAULT 0,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    balconies INTEGER DEFAULT 0,
    parking INTEGER DEFAULT 0,
    floor INTEGER DEFAULT 0,
    total_floors INTEGER DEFAULT 0,
    
    -- Location
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    pincode TEXT,
    locality TEXT,
    landmark TEXT,
    latitude DECIMAL(10,8) DEFAULT 0,
    longitude DECIMAL(11,8) DEFAULT 0,
    
    -- Property Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'rented', 'deleted')),
    availability TEXT DEFAULT 'immediate',
    possession_date TIMESTAMPTZ,
    
    -- Marketing
    featured BOOLEAN DEFAULT FALSE,
    premium BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    
    -- Additional Info
    age_of_property INTEGER DEFAULT 0,
    facing TEXT DEFAULT 'north',
    source TEXT DEFAULT 'direct',
    furnishing TEXT DEFAULT 'unfurnished',
    
    -- Contact Preferences
    contact_preference TEXT DEFAULT 'both',
    best_time_to_call TEXT DEFAULT 'anytime',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- JSON fields for arrays and complex data
    images JSONB DEFAULT '[]',
    videos JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    keywords JSONB DEFAULT '[]',
    
    -- Additional JSON fields
    virtual_tour TEXT,
    floor_plan TEXT
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    
    -- Lead Information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Inquiry Details
    message TEXT,
    budget TEXT,
    requirements TEXT,
    
    -- Lead Classification
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost', 'deleted')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    source TEXT DEFAULT 'website',
    
    -- Contact Information
    contact_method TEXT DEFAULT 'email' CHECK (contact_method IN ('email', 'phone', 'both')),
    preferred_time TEXT DEFAULT 'anytime',
    
    -- Lead Scoring
    score INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    
    -- Follow-up
    last_contact_at TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    follow_up_count INTEGER DEFAULT 0,
    
    -- Additional Details
    location TEXT,
    occupation TEXT,
    company TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Conversion Tracking
    converted_at TIMESTAMPTZ,
    conversion_value DECIMAL(15,2) DEFAULT 0,
    
    -- JSON fields for complex data
    notes JSONB DEFAULT '[]',
    history JSONB DEFAULT '[]',
    communications JSONB DEFAULT '[]'
);

-- Property Views table for tracking unique views
CREATE TABLE IF NOT EXISTS property_views (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate views from same user
    UNIQUE(property_id, user_id),
    
    -- Index for performance
    CONSTRAINT idx_property_views_property_user UNIQUE(property_id, user_id)
);

-- Revenue table
CREATE TABLE IF NOT EXISTS revenue (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Revenue Details
    amount DECIMAL(15,2) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    type TEXT DEFAULT 'commission' CHECK (type IN ('commission', 'subscription', 'service', 'other')),
    
    -- Transaction Details
    transaction_id TEXT,
    payment_method TEXT DEFAULT 'bank_transfer',
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    
    -- Additional Info
    description TEXT,
    category TEXT DEFAULT 'primary',
    recurring BOOLEAN DEFAULT FALSE,
    
    -- Tax Information
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    net_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Client Information
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- JSON fields for metrics
    views JSONB DEFAULT '{}',
    leads JSONB DEFAULT '{}',
    revenue JSONB DEFAULT '{}',
    properties JSONB DEFAULT '{}',
    activity JSONB DEFAULT '{}',
    traffic JSONB DEFAULT '{}',
    
    -- Unique constraint on date + user_id
    UNIQUE(date, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_revenue_user_id ON revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_property_id ON revenue(property_id);
CREATE INDEX IF NOT EXISTS idx_revenue_payment_status ON revenue(payment_status);
CREATE INDEX IF NOT EXISTS idx_revenue_created_at ON revenue(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your needs)
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own leads" ON leads FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own revenue" ON revenue FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own revenue" ON revenue FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own revenue" ON revenue FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own analytics" ON analytics FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own analytics" ON analytics FOR UPDATE USING (auth.uid()::text = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Property Views indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);

-- RPC Function to increment property views
CREATE OR REPLACE FUNCTION increment_property_views(prop_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE properties 
    SET views = views + 1,
        updated_at = NOW()
    WHERE id = prop_id;
END;
$$ LANGUAGE plpgsql;

-- RPC Function to get property view analytics
CREATE OR REPLACE FUNCTION get_property_view_analytics(prop_id TEXT, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_views INTEGER,
    unique_views INTEGER,
    views_today INTEGER,
    views_this_week INTEGER,
    views_this_month INTEGER,
    recent_viewers JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM property_views WHERE property_id = prop_id) as total_views,
        (SELECT COUNT(DISTINCT user_id) FROM property_views WHERE property_id = prop_id AND user_id IS NOT NULL) as unique_views,
        (SELECT COUNT(*) FROM property_views WHERE property_id = prop_id AND viewed_at >= CURRENT_DATE) as views_today,
        (SELECT COUNT(*) FROM property_views WHERE property_id = prop_id AND viewed_at >= CURRENT_DATE - INTERVAL '7 days') as views_this_week,
        (SELECT COUNT(*) FROM property_views WHERE property_id = prop_id AND viewed_at >= CURRENT_DATE - INTERVAL '30 days') as views_this_month,
        (SELECT COALESCE(json_agg(
            json_build_object(
                'viewed_at', pv.viewed_at,
                'user_id', pv.user_id,
                'session_id', pv.session_id
            )
        ), '[]'::json) 
        FROM property_views pv 
        WHERE pv.property_id = prop_id 
        AND pv.viewed_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
        ORDER BY pv.viewed_at DESC
        LIMIT 10) as recent_viewers;
END;
$$ LANGUAGE plpgsql;