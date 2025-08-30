-- =====================================================
-- Phase 2: Database Migration - Create New Tables
-- File: 002_create_new_tables.sql
-- Description: Create enhanced tables and new features for improved functionality
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For improved text search

-- =====================================================
-- MIGRATION LOG TABLE (for tracking migration progress)
-- =====================================================

CREATE TABLE IF NOT EXISTS migration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_file TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    migration_data JSONB
);

-- =====================================================
-- ENHANCED PUBLISHER MANAGEMENT
-- =====================================================

-- Publishers table (normalized from comic_series)
CREATE TABLE IF NOT EXISTS publishers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    aliases TEXT[], -- Alternative names for the publisher
    description TEXT,
    founded_year INTEGER,
    website_url TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENHANCED GRADING AND CONDITION MANAGEMENT
-- =====================================================

-- Condition descriptors table (more detailed than basic grading)
CREATE TABLE IF NOT EXISTS condition_descriptors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID NOT NULL REFERENCES grading_standards(id) ON DELETE CASCADE,
    descriptor_type TEXT NOT NULL, -- 'cover', 'pages', 'spine', 'staples'
    condition_detail TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major')),
    affects_value BOOLEAN DEFAULT TRUE,
    value_impact_percentage DECIMAL(5,2), -- percentage impact on value
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENHANCED MARKET DATA AND ANALYTICS
-- =====================================================

-- Price history table (for trend analysis)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES comic_issues(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES grading_standards(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    sale_date DATE NOT NULL,
    sale_type TEXT NOT NULL, -- 'auction', 'buy_it_now', 'private_sale'
    source TEXT NOT NULL, -- 'ebay', 'heritage', 'mycomicshop', etc.
    source_listing_id TEXT,
    seller_info JSONB,
    buyer_info JSONB,
    transaction_fees DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_positive_price_history CHECK (price > 0),
    CONSTRAINT chk_valid_sale_date CHECK (sale_date <= CURRENT_DATE)
);

-- Market trends table (advanced analytics)
CREATE TABLE IF NOT EXISTS market_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID REFERENCES comic_series(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES comic_issues(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grading_standards(id) ON DELETE CASCADE,
    publisher_id UUID REFERENCES publishers(id) ON DELETE CASCADE,
    
    -- Trend metrics
    trend_period TEXT NOT NULL CHECK (trend_period IN ('7d', '30d', '90d', '365d')),
    price_change_percentage DECIMAL(8,4),
    volume_change_percentage DECIMAL(8,4),
    volatility_score DECIMAL(5,2),
    momentum_indicator DECIMAL(5,2),
    
    -- Supporting data
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique trend records
    UNIQUE(series_id, issue_id, grade_id, publisher_id, trend_period, period_end_date)
);

-- =====================================================
-- ENHANCED USER EXPERIENCE TABLES
-- =====================================================

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Display preferences
    default_currency TEXT DEFAULT 'GBP',
    preferred_grading_companies TEXT[] DEFAULT '{"CGC","CBCS"}',
    price_display_format TEXT DEFAULT 'symbol', -- 'symbol', 'code', 'both'
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_quiet_hours JSONB, -- {"start": "22:00", "end": "08:00"}
    
    -- Privacy preferences
    public_collection BOOLEAN DEFAULT FALSE,
    public_wishlist BOOLEAN DEFAULT FALSE,
    share_analytics BOOLEAN DEFAULT TRUE,
    
    -- Feature preferences
    advanced_analytics BOOLEAN DEFAULT FALSE,
    beta_features BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- User activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'login', 'search', 'add_to_collection', 'create_alert', etc.
    activity_details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENHANCED SEARCH AND DISCOVERY
-- =====================================================

-- Popular searches table (for trending and suggestions)
CREATE TABLE IF NOT EXISTS popular_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_term TEXT NOT NULL,
    search_category TEXT, -- 'series', 'issue', 'publisher', 'general'
    search_count INTEGER DEFAULT 1,
    last_searched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(search_term, search_category)
);

-- Search history table (personalized for users)
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_term TEXT NOT NULL,
    search_category TEXT,
    results_count INTEGER,
    clicked_result_id UUID,
    clicked_result_type TEXT, -- 'series', 'issue', 'deal'
    search_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENHANCED DEALS AND RECOMMENDATIONS
-- =====================================================

-- Deal tags table (for better categorization)
CREATE TABLE IF NOT EXISTS deal_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color_hex TEXT DEFAULT '#3B82F6',
    icon_name TEXT,
    is_system_tag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for deal-tag relationships
CREATE TABLE IF NOT EXISTS deal_tag_assignments (
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES deal_tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    PRIMARY KEY (deal_id, tag_id)
);

-- User recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'similar_collection', 'trending', 'undervalued', 'price_drop'
    target_series_id UUID REFERENCES comic_series(id) ON DELETE CASCADE,
    target_issue_id UUID REFERENCES comic_issues(id) ON DELETE CASCADE,
    confidence_score DECIMAL(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    reason TEXT,
    recommendation_data JSONB,
    viewed_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_valid_recommendation_type CHECK (
        recommendation_type IN ('similar_collection', 'trending', 'undervalued', 'price_drop', 'key_issue', 'completing_run')
    )
);

-- =====================================================
-- PERFORMANCE AND ANALYTICS ENHANCEMENTS
-- =====================================================

-- System performance metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(12,4),
    metric_unit TEXT,
    measurement_timestamp TIMESTAMPTZ DEFAULT NOW(),
    additional_data JSONB
);

-- Data quality metrics table
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'completeness', 'accuracy', 'consistency', 'freshness'
    metric_value DECIMAL(5,2),
    total_records BIGINT,
    quality_issues JSONB,
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMPREHENSIVE INDEXES FOR NEW TABLES
-- =====================================================

-- Publishers indexes
CREATE INDEX IF NOT EXISTS idx_publishers_name ON publishers (name);
CREATE INDEX IF NOT EXISTS idx_publishers_name_trgm ON publishers USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_publishers_aliases ON publishers USING gin(aliases);

-- Condition descriptors indexes
CREATE INDEX IF NOT EXISTS idx_condition_descriptors_grade_id ON condition_descriptors (grade_id);
CREATE INDEX IF NOT EXISTS idx_condition_descriptors_type ON condition_descriptors (descriptor_type);

-- Price history indexes
CREATE INDEX IF NOT EXISTS idx_price_history_series_issue_grade ON price_history (series_id, issue_id, grade_id);
CREATE INDEX IF NOT EXISTS idx_price_history_sale_date ON price_history (sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_source ON price_history (source);
CREATE INDEX IF NOT EXISTS idx_price_history_price ON price_history (price);

-- Market trends indexes
CREATE INDEX IF NOT EXISTS idx_market_trends_series_issue ON market_trends (series_id, issue_id);
CREATE INDEX IF NOT EXISTS idx_market_trends_period ON market_trends (trend_period, period_end_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_trends_analysis_date ON market_trends (analysis_date DESC);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id);

-- User activity log indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log (activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log (created_at DESC);

-- Popular searches indexes
CREATE INDEX IF NOT EXISTS idx_popular_searches_term ON popular_searches (search_term);
CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches (search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_searches_category ON popular_searches (search_category);

-- User search history indexes
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history (user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_timestamp ON user_search_history (search_timestamp DESC);

-- Deal tags indexes
CREATE INDEX IF NOT EXISTS idx_deal_tags_name ON deal_tags (name);
CREATE INDEX IF NOT EXISTS idx_deal_tag_assignments_deal_id ON deal_tag_assignments (deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_tag_assignments_tag_id ON deal_tag_assignments (tag_id);

-- User recommendations indexes
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations (user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_type ON user_recommendations (recommendation_type);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_confidence ON user_recommendations (confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_expires_at ON user_recommendations (expires_at) WHERE expires_at IS NOT NULL;

-- System metrics indexes
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_timestamp ON system_metrics (metric_name, measurement_timestamp DESC);

-- Data quality metrics indexes
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_table_measured ON data_quality_metrics (table_name, measured_at DESC);

-- =====================================================
-- UPDATE TRIGGERS FOR NEW TABLES
-- =====================================================

-- Apply timestamp triggers to new tables with updated_at columns
CREATE TRIGGER update_publishers_updated_at
    BEFORE UPDATE ON publishers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Log completion
INSERT INTO migration_log (migration_file, status, completed_at) 
VALUES ('002_create_new_tables.sql', 'completed', NOW());