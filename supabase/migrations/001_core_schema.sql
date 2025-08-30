-- =====================================================
-- ComicScoutUK Database Migration: Core Schema
-- File: 001_core_schema.sql
-- Description: Complete database schema with all required tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS if needed for future location features
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- CORE ENTITY TABLES
-- =====================================================

-- Users table (integrates with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ
);

-- Comic Series table
CREATE TABLE IF NOT EXISTS comic_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    aliases TEXT[], -- Alternative names/titles for the series
    publisher TEXT NOT NULL,
    publication_start_date DATE,
    publication_end_date DATE,
    description TEXT,
    image_url TEXT,
    genre TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_series_dates CHECK (
        publication_end_date IS NULL OR 
        publication_end_date >= publication_start_date
    )
);

-- Comic Issues table
CREATE TABLE IF NOT EXISTS comic_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_number TEXT NOT NULL,
    variant TEXT, -- Cover variant designation
    release_date DATE,
    key_issue BOOLEAN DEFAULT FALSE,
    key_issue_notes TEXT,
    cover_image_url TEXT,
    synopsis TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique combinations
    UNIQUE(series_id, issue_number, variant)
);

-- Grading Standards table
CREATE TABLE IF NOT EXISTS grading_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT NOT NULL, -- CGC, CBCS, PGX, Raw, etc.
    grade_value DECIMAL(3,1) NOT NULL,
    grade_label TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique grade combinations
    UNIQUE(company, grade_value)
);

-- =====================================================
-- DATA INGESTION PIPELINE TABLES
-- =====================================================

-- Raw Listings (from data ingestion)
CREATE TABLE IF NOT EXISTS raw_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL, -- 'ebay', 'heritage', 'mycomicshop', etc.
    source_listing_id TEXT NOT NULL,
    raw_data JSONB NOT NULL,
    listing_url TEXT,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processing_status TEXT DEFAULT 'pending',
    processing_errors TEXT[],
    
    -- Ensure we don't duplicate raw data from same source
    UNIQUE(source, source_listing_id)
);

-- Normalized Listings (processed and cleaned)
CREATE TABLE IF NOT EXISTS normalized_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_listing_id UUID REFERENCES raw_listings(id) ON DELETE CASCADE,
    series_id UUID REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES comic_issues(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grading_standards(id) ON DELETE CASCADE,
    
    -- Listing details
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (price + COALESCE(shipping_cost, 0)) STORED,
    currency TEXT DEFAULT 'GBP',
    
    -- Listing metadata
    seller_name TEXT,
    seller_feedback_score INTEGER,
    auction_type TEXT, -- 'auction', 'buy_it_now', 'best_offer'
    ends_at TIMESTAMPTZ,
    listing_url TEXT,
    image_urls TEXT[],
    
    -- Grading info
    is_graded BOOLEAN DEFAULT FALSE,
    grade_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_positive_price CHECK (price > 0),
    CONSTRAINT chk_non_negative_shipping CHECK (shipping_cost >= 0)
);

-- Market Values (aggregated pricing data)
CREATE TABLE IF NOT EXISTS market_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES comic_issues(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES grading_standards(id) ON DELETE CASCADE,
    
    -- Statistical data
    sample_count INTEGER NOT NULL DEFAULT 0,
    median_price DECIMAL(10,2),
    mean_price DECIMAL(10,2),
    stddev_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    
    -- Price trend data
    price_trend_30d DECIMAL(5,2), -- % change over 30 days
    price_trend_90d DECIMAL(5,2), -- % change over 90 days
    
    -- Data freshness
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique market value per comic-grade combination
    UNIQUE(series_id, issue_id, grade_id),
    
    -- Constraints
    CONSTRAINT chk_sample_count CHECK (sample_count >= 0),
    CONSTRAINT chk_positive_prices CHECK (
        (median_price IS NULL OR median_price > 0) AND
        (mean_price IS NULL OR mean_price > 0) AND
        (min_price IS NULL OR min_price > 0) AND
        (max_price IS NULL OR max_price > 0)
    )
);

-- Deals (high-value opportunities)
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    normalized_listing_id UUID NOT NULL REFERENCES normalized_listings(id) ON DELETE CASCADE,
    market_value_id UUID NOT NULL REFERENCES market_values(id) ON DELETE CASCADE,
    
    -- Deal scoring
    deal_score DECIMAL(5,2) NOT NULL,
    potential_profit DECIMAL(10,2),
    profit_percentage DECIMAL(5,2),
    
    -- Deal classification
    deal_type TEXT NOT NULL, -- 'underpriced', 'auction_ending', 'key_issue', etc.
    confidence_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    
    -- Deal metadata
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_deal_score CHECK (deal_score >= 0 AND deal_score <= 100),
    CONSTRAINT chk_confidence_level CHECK (
        confidence_level IN ('low', 'medium', 'high')
    )
);

-- =====================================================
-- USER INTERACTION TABLES
-- =====================================================

-- User Collections
CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    series_id UUID NOT NULL REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES comic_issues(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grading_standards(id) ON DELETE SET NULL,
    
    -- Collection details
    acquisition_date DATE,
    acquisition_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    notes TEXT,
    condition_notes TEXT,
    storage_location TEXT,
    
    -- Personal metadata
    is_wishlist_item BOOLEAN DEFAULT FALSE,
    personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 10),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate entries
    UNIQUE(user_id, series_id, issue_id, grade_id)
);

-- User Alert Rules
CREATE TABLE IF NOT EXISTS user_alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Alert targeting
    series_id UUID REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES comic_issues(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grading_standards(id) ON DELETE CASCADE,
    
    -- Alert conditions
    max_price DECIMAL(10,2),
    min_deal_score DECIMAL(5,2),
    auction_types TEXT[], -- Which auction types to monitor
    
    -- Alert settings
    is_active BOOLEAN DEFAULT TRUE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_min_deal_score CHECK (
        min_deal_score IS NULL OR 
        (min_deal_score >= 0 AND min_deal_score <= 100)
    )
);

-- Alert History/Log
CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_rule_id UUID NOT NULL REFERENCES user_alert_rules(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type TEXT NOT NULL, -- 'email', 'push', 'sms'
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivery_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message TEXT,
    
    -- User interaction tracking
    opened_at TIMESTAMPTZ,
    clicked_through_at TIMESTAMPTZ
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_comic_series_name ON comic_series (name);
CREATE INDEX IF NOT EXISTS idx_comic_series_publisher ON comic_series (publisher);
CREATE INDEX IF NOT EXISTS idx_comic_series_aliases ON comic_series USING gin(aliases);

CREATE INDEX IF NOT EXISTS idx_comic_issues_series_id ON comic_issues (series_id);
CREATE INDEX IF NOT EXISTS idx_comic_issues_series_issue ON comic_issues (series_id, issue_number);
CREATE INDEX IF NOT EXISTS idx_comic_issues_key_issue ON comic_issues (key_issue) WHERE key_issue = TRUE;

-- Data pipeline indexes
CREATE INDEX IF NOT EXISTS idx_raw_listings_source_status ON raw_listings (source, processing_status);
CREATE INDEX IF NOT EXISTS idx_raw_listings_extracted_at ON raw_listings (extracted_at);

CREATE INDEX IF NOT EXISTS idx_normalized_listings_series_issue_grade ON normalized_listings (series_id, issue_id, grade_id);
CREATE INDEX IF NOT EXISTS idx_normalized_listings_price ON normalized_listings (total_cost);
CREATE INDEX IF NOT EXISTS idx_normalized_listings_ends_at ON normalized_listings (ends_at) WHERE ends_at IS NOT NULL;

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_values_series_issue_grade ON market_values (series_id, issue_id, grade_id);
CREATE INDEX IF NOT EXISTS idx_market_values_calculation_date ON market_values (calculation_date);

-- Deal discovery indexes
CREATE INDEX IF NOT EXISTS idx_deals_score ON deals (deal_score DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_deals_expires_at ON deals (expires_at) WHERE is_active = TRUE AND expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON deals (deal_type) WHERE is_active = TRUE;

-- User interaction indexes
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections (user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_series_id ON user_collections (series_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_wishlist ON user_collections (user_id) WHERE is_wishlist_item = TRUE;

CREATE INDEX IF NOT EXISTS idx_alert_rules_user_active ON user_alert_rules (user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_alert_rules_series_id ON user_alert_rules (series_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_alert_notifications_rule_id ON alert_notifications (alert_rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_sent_at ON alert_notifications (sent_at);

-- =====================================================
-- AUTO-UPDATE TIMESTAMP TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comic_series_updated_at
    BEFORE UPDATE ON comic_series
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comic_issues_updated_at
    BEFORE UPDATE ON comic_issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_normalized_listings_updated_at
    BEFORE UPDATE ON normalized_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_market_values_updated_at
    BEFORE UPDATE ON market_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_collections_updated_at
    BEFORE UPDATE ON user_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_alert_rules_updated_at
    BEFORE UPDATE ON user_alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();