-- Add Tours table for property tour scheduling
-- Run this SQL in your Supabase SQL Editor to add tour functionality

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
    id TEXT PRIMARY KEY DEFAULT 'tour_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 9),
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    property_owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
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
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Communication
    confirmation_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    feedback_requested BOOLEAN DEFAULT FALSE,
    
    -- Tour Type
    tour_type TEXT DEFAULT 'physical' CHECK (tour_type IN ('physical', 'virtual', 'both')),
    duration_minutes INTEGER DEFAULT 45,
    
    -- Additional Information
    visitor_requirements TEXT,
    special_instructions TEXT,
    agent_notes TEXT,
    
    -- Contact Preferences
    preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
    best_time_to_contact TEXT DEFAULT 'anytime',
    
    -- Tracking
    source TEXT DEFAULT 'website',
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Feedback and Rating
    visitor_rating INTEGER CHECK (visitor_rating >= 1 AND visitor_rating <= 5),
    visitor_feedback TEXT,
    agent_rating INTEGER CHECK (agent_rating >= 1 AND agent_rating <= 5),
    agent_feedback TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date TIMESTAMPTZ,
    follow_up_notes TEXT,
    
    -- JSON fields for complex data
    visitor_details JSONB DEFAULT '{}',
    tour_details JSONB DEFAULT '{}',
    communication_history JSONB DEFAULT '[]'
);

-- Tour Availability table (for agents to set their available time slots)
CREATE TABLE IF NOT EXISTS tour_availability (
    id TEXT PRIMARY KEY DEFAULT 'avail_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 9),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Availability Details
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Slot Configuration
    slot_duration_minutes INTEGER DEFAULT 45,
    buffer_time_minutes INTEGER DEFAULT 15,
    max_tours_per_slot INTEGER DEFAULT 1,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Date Range (optional - for temporary availability changes)
    effective_from DATE,
    effective_until DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional Settings
    settings JSONB DEFAULT '{}'
);

-- Tour Notifications table (for tracking email/SMS notifications)
CREATE TABLE IF NOT EXISTS tour_notifications (
    id TEXT PRIMARY KEY DEFAULT 'notif_' || extract(epoch from now()) || '_' || substr(md5(random()::text), 1, 9),
    tour_id TEXT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    
    -- Notification Details
    type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder', 'cancellation', 'reschedule', 'feedback')),
    method TEXT NOT NULL CHECK (method IN ('email', 'sms', 'push')),
    recipient TEXT NOT NULL, -- email or phone number
    
    -- Content
    subject TEXT,
    message TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tours_property_id ON tours(property_id);
CREATE INDEX IF NOT EXISTS idx_tours_property_owner_id ON tours(property_owner_id);
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_tour_date ON tours(tour_date);
-- Removed tour_datetime index since we removed the generated column
CREATE INDEX IF NOT EXISTS idx_tours_visitor_email ON tours(visitor_email);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);

CREATE INDEX IF NOT EXISTS idx_tour_availability_user_id ON tour_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_availability_day_of_week ON tour_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_tour_availability_is_active ON tour_availability(is_active);

CREATE INDEX IF NOT EXISTS idx_tour_notifications_tour_id ON tour_notifications(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_notifications_status ON tour_notifications(status);
CREATE INDEX IF NOT EXISTS idx_tour_notifications_scheduled_at ON tour_notifications(scheduled_at);

-- Enable Row Level Security (RLS)
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_notifications ENABLE ROW LEVEL SECURITY;

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

-- Create RLS policies for tour_availability
CREATE POLICY "Users can manage their own availability" ON tour_availability 
    FOR ALL USING (auth.uid()::text = user_id);

-- Create RLS policies for tour_notifications
CREATE POLICY "Users can view notifications for their tours" ON tour_notifications 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tours 
            WHERE tours.id = tour_notifications.tour_id 
            AND tours.property_owner_id = auth.uid()::text
        )
    );

-- Create updated_at triggers
CREATE TRIGGER update_tours_updated_at 
    BEFORE UPDATE ON tours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_availability_updated_at 
    BEFORE UPDATE ON tour_availability 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_notifications_updated_at 
    BEFORE UPDATE ON tour_notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC Function to get available time slots for a property
CREATE OR REPLACE FUNCTION get_available_tour_slots(
    prop_id TEXT,
    start_date DATE DEFAULT CURRENT_DATE,
    days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    "time" TIME,
    available BOOLEAN,
    booked_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(
            start_date,
            start_date + (days_ahead || ' days')::INTERVAL,
            '1 day'::INTERVAL
        )::DATE as date
    ),
    property_owner AS (
        SELECT user_id FROM properties WHERE id = prop_id
    ),
    available_slots AS (
        SELECT 
            ds.date,
            generate_series(
                ta.start_time,
                ta.end_time - (ta.slot_duration_minutes || ' minutes')::INTERVAL,
                (ta.slot_duration_minutes + ta.buffer_time_minutes || ' minutes')::INTERVAL
            )::TIME as "time",
            ta.max_tours_per_slot
        FROM date_series ds
        CROSS JOIN tour_availability ta
        CROSS JOIN property_owner po
        WHERE ta.user_id = po.user_id
        AND ta.is_active = true
        AND ta.day_of_week = EXTRACT(DOW FROM ds.date)
        AND ds.date > CURRENT_DATE -- Don't show past dates
        AND (ta.effective_from IS NULL OR ds.date >= ta.effective_from)
        AND (ta.effective_until IS NULL OR ds.date <= ta.effective_until)
    ),
    booked_slots AS (
        SELECT 
            tour_date as date,
            tour_time as "time",
            COUNT(*) as booked_count
        FROM tours
        WHERE property_id = prop_id
        AND status IN ('pending', 'confirmed')
        GROUP BY tour_date, tour_time
    )
    SELECT 
        as_slots.date,
        as_slots."time",
        COALESCE(bs.booked_count, 0) < as_slots.max_tours_per_slot as available,
        COALESCE(bs.booked_count, 0) as booked_count
    FROM available_slots as_slots
    LEFT JOIN booked_slots bs ON as_slots.date = bs.date AND as_slots."time" = bs."time"
    ORDER BY as_slots.date, as_slots."time";
END;
$$ LANGUAGE plpgsql;

-- RPC Function to get tour statistics for a user
CREATE OR REPLACE FUNCTION get_tour_statistics(user_id_param TEXT)
RETURNS TABLE (
    total_tours INTEGER,
    pending_tours INTEGER,
    confirmed_tours INTEGER,
    completed_tours INTEGER,
    cancelled_tours INTEGER,
    no_show_tours INTEGER,
    tours_this_month INTEGER,
    tours_this_week INTEGER,
    tours_today INTEGER,
    upcoming_tours INTEGER,
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_tours,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_tours,
        COUNT(*) FILTER (WHERE status = 'confirmed')::INTEGER as confirmed_tours,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_tours,
        COUNT(*) FILTER (WHERE status = 'cancelled')::INTEGER as cancelled_tours,
        COUNT(*) FILTER (WHERE status = 'no_show')::INTEGER as no_show_tours,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::INTEGER as tours_this_month,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE))::INTEGER as tours_this_week,
        COUNT(*) FILTER (WHERE tour_date = CURRENT_DATE)::INTEGER as tours_today,
        COUNT(*) FILTER (WHERE (tour_date + tour_time) > NOW() AND status IN ('pending', 'confirmed'))::INTEGER as upcoming_tours,
        CASE 
            WHEN COUNT(*) FILTER (WHERE status IN ('completed', 'no_show')) > 0 
            THEN (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*) FILTER (WHERE status IN ('completed', 'no_show'))::DECIMAL * 100)
            ELSE 0
        END as conversion_rate
    FROM tours
    WHERE property_owner_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- RPC Function to get upcoming tours for a user
CREATE OR REPLACE FUNCTION get_upcoming_tours(user_id_param TEXT, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
    id TEXT,
    property_id TEXT,
    property_title TEXT,
    visitor_name TEXT,
    visitor_email TEXT,
    visitor_phone TEXT,
    tour_date DATE,
    tour_time TIME,
    tour_datetime TIMESTAMPTZ,
    status TEXT,
    visitor_message TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.property_id,
        p.title as property_title,
        t.visitor_name,
        t.visitor_email,
        t.visitor_phone,
        t.tour_date,
        t.tour_time,
        (t.tour_date + t.tour_time) as tour_datetime,
        t.status,
        t.visitor_message,
        t.created_at
    FROM tours t
    JOIN properties p ON t.property_id = p.id
    WHERE t.property_owner_id = user_id_param
    AND (t.tour_date + t.tour_time) > NOW()
    AND t.status IN ('pending', 'confirmed')
    ORDER BY (t.tour_date + t.tour_time) ASC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;
