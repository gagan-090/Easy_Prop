-- Simple Tours table migration (without complex functions)
-- Run this SQL in your Supabase SQL Editor to add basic tour functionality

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY DEFAULT 'tour_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 9),
    property_id TEXT NOT NULL,
    property_owner_id TEXT NOT NULL,
    
    -- Visitor Information
    visitor_name TEXT NOT NULL,
    visitor_email TEXT NOT NULL,
    visitor_phone TEXT NOT NULL,
    visitor_message TEXT,
    
    -- Tour Details
    tour_date DATE NOT NULL,
    tour_time TIME NOT NULL,
    
    -- Status Management
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    
    -- Tour Type
    tour_type TEXT DEFAULT 'physical' CHECK (tour_type IN ('physical', 'virtual', 'both')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_property_id ON tours(property_id);
CREATE INDEX IF NOT EXISTS idx_tours_property_owner_id ON tours(property_owner_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_tour_date ON tours(tour_date);
CREATE INDEX IF NOT EXISTS idx_tours_visitor_email ON tours(visitor_email);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tours
-- Property owners can see tours for their properties
CREATE POLICY "Property owners can view tours for their properties" ON tours 
    FOR SELECT USING (auth.uid()::text = property_owner_id);

-- Property owners can update tours for their properties
CREATE POLICY "Property owners can update tours for their properties" ON tours 
    FOR UPDATE USING (auth.uid()::text = property_owner_id);

-- Anyone can insert tours (for scheduling)
CREATE POLICY "Anyone can schedule tours" ON tours 
    FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER update_tours_updated_at 
    BEFORE UPDATE ON tours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the table creation
SELECT 'Tours table created successfully! You can now schedule tours.' as message;