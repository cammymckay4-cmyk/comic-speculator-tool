-- ============================================================================
-- ComicScoutUK Database Migration - Phase 2
-- Script: 002_create_new_tables.sql
-- Purpose: Create all new tables according to target schema specification
-- Created: August 29, 2025
-- Author: Lead Refactoring Architect
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- DROP EXISTING TABLES (IF EXISTS) - CAREFUL!
-- Only drop tables that will be recreated with new schema
-- ============================================================================

-- Note: This section should only be used if existing tables need complete recreation
-- Uncomment only after confirming backup is successful

-- DROP TABLE IF EXISTS user_trophies CASCADE;
-- DROP TABLE IF EXISTS trophies CASCADE;
-- DROP TABLE IF EXISTS alert_history CASCADE;
-- DROP TABLE IF EXISTS ebay_listings CASCADE;
-- DROP TABLE IF EXISTS comic_comments CASCADE;
-- DROP TABLE IF EXISTS user_follows CASCADE;
-- DROP TABLE IF EXISTS alert_settings CASCADE;
-- DROP TABLE IF EXISTS wishlist_items CASCADE;
-- DROP TABLE IF EXISTS user_collection CASCADE;
-- DROP TABLE IF EXISTS comics CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. CREATE USERS TABLE (Enhanced)
-- ============================================================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- May be managed by Supabase Auth
    subscription_tier VARCHAR(20) DEFAULT 'free' 
        CHECK (subscription_tier IN ('free', 'medium', 'pro')),
    profile_is_public BOOLEAN DEFAULT false,
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    
    -- Profile details
    bio TEXT,
    location VARCHAR(100),
    website_url VARCHAR(255),
    
    -- Preferences
    email_notifications_enabled BOOLEAN DEFAULT true,
    push_notifications_enabled BOOLEAN DEFAULT true,
    privacy_settings JSONB DEFAULT '{}',
    
    -- Statistics (computed fields)
    total_collection_value DECIMAL(12,2) DEFAULT 0.00,
    total_comics_owned INTEGER DEFAULT 0,
    profile_views INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE
);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Enhanced user profiles supporting social features and subscription tiers';
COMMENT ON COLUMN users.subscription_tier IS 'User subscription level: free, medium, or pro';
COMMENT ON COLUMN users.profile_is_public IS 'Controls visibility of user profile and collection to other users';
COMMENT ON COLUMN users.privacy_settings IS 'JSON object containing various privacy preferences';

-- ============================================================================
-- 2. CREATE COMICS TABLE (Enhanced)
-- ============================================================================

CREATE TABLE comics (
    comic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    issue_number VARCHAR(50) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    series_id UUID, -- References a series table (future implementation)
    
    -- Publication details
    publication_date DATE,
    cover_image_url VARCHAR(255),
    description TEXT,
    
    -- Market data
    current_market_value DECIMAL(10,2),
    last_market_update TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    page_count INTEGER,
    cover_artist VARCHAR(100),
    writer VARCHAR(100),
    isbn VARCHAR(20),
    barcode VARCHAR(50),
    
    -- Search optimization
    search_vector tsvector,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_comic_issue UNIQUE (title, issue_number, publisher)
);

-- Add comments
COMMENT ON TABLE comics IS 'Enhanced comic book information with market data and metadata';
COMMENT ON COLUMN comics.search_vector IS 'Full-text search vector for title, publisher, and description';
COMMENT ON COLUMN comics.current_market_value IS 'Latest Fair Market Value from GoCollect API';

-- ============================================================================
-- 3. CREATE USER_COLLECTION TABLE (Enhanced)
-- ============================================================================

CREATE TABLE user_collection (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comic_id UUID NOT NULL REFERENCES comics(comic_id) ON DELETE CASCADE,
    
    -- Purchase information
    purchase_price DECIMAL(10,2),
    purchase_date DATE,
    purchase_location VARCHAR(100),
    
    -- Condition details
    grade VARCHAR(20), -- e.g., 'NM', '9.8', 'CGC 9.6'
    grader VARCHAR(50), -- e.g., 'CGC', 'CBCS', 'Raw'
    condition_notes TEXT,
    
    -- Images and documentation
    user_submitted_image_url VARCHAR(255),
    certificate_image_url VARCHAR(255), -- For graded comics
    additional_images JSONB DEFAULT '[]', -- Array of image URLs
    
    -- Market tracking
    current_value DECIMAL(10,2),
    profit_loss DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN purchase_price IS NOT NULL AND current_value IS NOT NULL 
            THEN current_value - purchase_price 
            ELSE NULL 
        END
    ) STORED,
    
    -- Collection status
    is_for_sale BOOLEAN DEFAULT false,
    asking_price DECIMAL(10,2),
    
    -- Personal notes
    personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 10),
    personal_notes TEXT,
    tags VARCHAR(255)[], -- Array of user-defined tags
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_comic UNIQUE (user_id, comic_id),
    CONSTRAINT valid_grade CHECK (grade IS NULL OR grade ~ '^[0-9.]+$|^[A-Z]{1,3}[+-]?$'),
    CONSTRAINT valid_asking_price CHECK (asking_price IS NULL OR asking_price > 0)
);

-- Add comments
COMMENT ON TABLE user_collection IS 'Enhanced user comic collection with profit/loss tracking and detailed metadata';
COMMENT ON COLUMN user_collection.profit_loss IS 'Computed field showing current profit or loss on investment';
COMMENT ON COLUMN user_collection.tags IS 'User-defined tags for organization and filtering';

-- ============================================================================
-- 4. CREATE WISHLIST_ITEMS TABLE (New)
-- ============================================================================

CREATE TABLE wishlist_items (
    want_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comic_id UUID NOT NULL REFERENCES comics(comic_id) ON DELETE CASCADE,
    
    -- Search criteria
    min_grade VARCHAR(20), -- Minimum acceptable grade
    max_price DECIMAL(10,2), -- Maximum willing to pay
    must_be_graded BOOLEAN DEFAULT false,
    grader_preference VARCHAR(50), -- Preferred grading company
    
    -- Priority and organization
    priority_level INTEGER DEFAULT 5 CHECK (priority_level BETWEEN 1 AND 10),
    category VARCHAR(50), -- e.g., 'Key Issues', 'Complete Series', 'Investment'
    
    -- Alert preferences (item-specific overrides)
    alert_on_new_listing BOOLEAN DEFAULT true,
    alert_on_price_drop BOOLEAN DEFAULT true,
    alert_threshold_percentage INTEGER DEFAULT 20, -- Alert if X% below max_price
    
    -- Personal notes
    notes TEXT,
    deadline DATE, -- Optional deadline for acquisition
    
    -- Status tracking
    is_active BOOLEAN DEFAULT true,
    times_alerted INTEGER DEFAULT 0,
    last_alert_sent TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_want UNIQUE (user_id, comic_id),
    CONSTRAINT valid_priority CHECK (priority_level BETWEEN 1 AND 10),
    CONSTRAINT valid_max_price CHECK (max_price IS NULL OR max_price > 0),
    CONSTRAINT valid_alert_threshold CHECK (alert_threshold_percentage BETWEEN 1 AND 100)
);

-- Add comments
COMMENT ON TABLE wishlist_items IS 'User wishlist with detailed search criteria and alert preferences';
COMMENT ON COLUMN wishlist_items.priority_level IS '1 = Highest priority, 10 = Lowest priority';
COMMENT ON COLUMN wishlist_items.alert_threshold_percentage IS 'Percentage below max_price that triggers alerts';

-- ============================================================================
-- 5. CREATE ALERT_SETTINGS TABLE (New)
-- ============================================================================

CREATE TABLE alert_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    want_id UUID REFERENCES wishlist_items(want_id) ON DELETE CASCADE, -- NULL for global settings
    
    -- Alert configuration
    alert_type VARCHAR(30) NOT NULL 
        CHECK (alert_type IN ('new_deal', 'ending_soon', 'stale_listing', 'sell_alert', 'price_drop', 'watchlist')),
    is_active BOOLEAN DEFAULT true,
    
    -- Threshold configuration (flexible JSON structure)
    threshold JSONB NOT NULL DEFAULT '{}',
    -- Example threshold structures:
    -- new_deal: {"percentage_below_fmv": 20, "max_price": 100.00}
    -- ending_soon: {"hours_remaining": 2}
    -- sell_alert: {"target_value": 150.00, "percentage_gain": 25}
    
    -- Notification preferences
    notification_methods JSONB DEFAULT '["email"]', -- ["email", "push", "sms"]
    frequency VARCHAR(20) DEFAULT 'immediate' 
        CHECK (frequency IN ('immediate', 'daily', 'weekly')),
    
    -- Scheduling
    active_hours_start TIME,
    active_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Tracking
    alerts_sent_count INTEGER DEFAULT 0,
    last_alert_sent TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE alert_settings IS 'Flexible alert configuration system supporting global and item-specific settings';
COMMENT ON COLUMN alert_settings.threshold IS 'JSON configuration for alert trigger conditions';
COMMENT ON COLUMN alert_settings.notification_methods IS 'Array of notification delivery methods';

-- ============================================================================
-- 6. CREATE TROPHIES TABLE (New)
-- ============================================================================

CREATE TABLE trophies (
    trophy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Visual elements
    icon_url VARCHAR(255),
    tier VARCHAR(20) DEFAULT 'bronze' 
        CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    color VARCHAR(7), -- Hex color code
    
    -- Achievement rules (JSON configuration)
    rules JSONB NOT NULL,
    -- Example rules:
    -- {"type": "collection_value", "threshold": 1000, "currency": "GBP"}
    -- {"type": "complete_series", "series_name": "Amazing Spider-Man", "issues_required": 100}
    -- {"type": "collection_count", "threshold": 500}
    
    -- Gamification
    points_value INTEGER DEFAULT 0,
    rarity VARCHAR(20) DEFAULT 'common' 
        CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    
    -- Category
    category VARCHAR(50), -- e.g., 'Collector', 'Investor', 'Social', 'Explorer'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_secret BOOLEAN DEFAULT false, -- Hidden until earned
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE trophies IS 'PlayStation-style trophy system for gamification';
COMMENT ON COLUMN trophies.rules IS 'JSON configuration defining how trophy is earned';
COMMENT ON COLUMN trophies.is_secret IS 'Hidden trophies not visible until earned';

-- ============================================================================
-- 7. CREATE USER_TROPHIES TABLE (New)
-- ============================================================================

CREATE TABLE user_trophies (
    user_trophy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    trophy_id UUID NOT NULL REFERENCES trophies(trophy_id) ON DELETE CASCADE,
    
    -- Achievement details
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB, -- For tracking progress toward trophy
    completion_percentage INTEGER DEFAULT 100 
        CHECK (completion_percentage BETWEEN 0 AND 100),
    
    -- Context when earned
    trigger_event VARCHAR(100), -- What action triggered the trophy
    snapshot_data JSONB, -- Relevant stats when trophy was earned
    
    -- Constraints
    CONSTRAINT unique_user_trophy UNIQUE (user_id, trophy_id)
);

-- Add comments
COMMENT ON TABLE user_trophies IS 'Junction table tracking which trophies users have earned';
COMMENT ON COLUMN user_trophies.progress_data IS 'JSON data tracking progress toward trophy completion';

-- ============================================================================
-- 8. CREATE USER_FOLLOWS TABLE (New - Social Features)
-- ============================================================================

CREATE TABLE user_follows (
    follow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Follow details
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notification_preferences JSONB DEFAULT '{"new_additions": true, "milestones": true}',
    
    -- Constraints
    CONSTRAINT unique_follow UNIQUE (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Add comments
COMMENT ON TABLE user_follows IS 'Social following system for users to follow each others collections';

-- ============================================================================
-- 9. CREATE COMIC_COMMENTS TABLE (New - Social Features)
-- ============================================================================

CREATE TABLE comic_comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comic_id UUID NOT NULL REFERENCES comics(comic_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Comment content
    comment_text TEXT NOT NULL CHECK (LENGTH(comment_text) <= 2000),
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    moderator_notes TEXT,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    edit_reason VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE comic_comments IS 'User comments on individual comic issues (Premium feature)';

-- ============================================================================
-- 10. CREATE EBAY_LISTINGS TABLE (New - Scouting Engine)
-- ============================================================================

CREATE TABLE ebay_listings (
    listing_id VARCHAR(50) PRIMARY KEY, -- eBay listing ID
    comic_id UUID REFERENCES comics(comic_id) ON DELETE SET NULL,
    
    -- Listing details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Condition and details
    condition_description TEXT,
    item_location VARCHAR(100),
    shipping_cost DECIMAL(8,2),
    returns_accepted BOOLEAN,
    
    -- Seller information
    seller_username VARCHAR(100),
    seller_feedback_score INTEGER,
    seller_feedback_percentage DECIMAL(5,2),
    
    -- eBay specifics
    listing_url VARCHAR(500) NOT NULL,
    listing_type VARCHAR(20), -- auction, buy_it_now, classified
    bid_count INTEGER DEFAULT 0,
    watch_count INTEGER DEFAULT 0,
    
    -- Our analysis
    deal_score DECIMAL(5,2), -- Calculated deal score vs FMV
    match_confidence DECIMAL(3,2) DEFAULT 0.00, -- How confident we are this matches our comic
    
    -- Tracking
    is_tracked BOOLEAN DEFAULT true,
    is_sold BOOLEAN DEFAULT false,
    sold_price DECIMAL(10,2),
    
    -- Timestamps
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE ebay_listings IS 'Tracked eBay listings for scouting engine and deal analysis';
COMMENT ON COLUMN ebay_listings.deal_score IS 'Calculated score comparing listing price to Fair Market Value';
COMMENT ON COLUMN ebay_listings.match_confidence IS 'Algorithm confidence that this listing matches our comic data';

-- ============================================================================
-- 11. CREATE ALERT_HISTORY TABLE (New - Alert Tracking)
-- ============================================================================

CREATE TABLE alert_history (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Alert details
    alert_type VARCHAR(30) NOT NULL,
    comic_id UUID REFERENCES comics(comic_id) ON DELETE SET NULL,
    listing_id VARCHAR(50) REFERENCES ebay_listings(listing_id) ON DELETE SET NULL,
    want_id UUID REFERENCES wishlist_items(want_id) ON DELETE SET NULL,
    
    -- Message content
    subject VARCHAR(255),
    message_content TEXT NOT NULL,
    message_html TEXT,
    
    -- Delivery tracking
    delivery_method VARCHAR(20) DEFAULT 'email' 
        CHECK (delivery_method IN ('email', 'push', 'sms', 'in_app')),
    delivery_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    delivery_attempts INTEGER DEFAULT 0,
    
    -- Engagement tracking
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    trigger_data JSONB, -- Data that triggered the alert
    delivery_provider VARCHAR(50), -- Resend, etc.
    external_message_id VARCHAR(100), -- Provider's message ID
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Add comments
COMMENT ON TABLE alert_history IS 'Complete history of all alerts sent to users with delivery tracking';
COMMENT ON COLUMN alert_history.trigger_data IS 'JSON data about what triggered the alert';

-- ============================================================================
-- 12. CREATE SERIES TABLE (Future Implementation)
-- ============================================================================

CREATE TABLE series (
    series_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    publisher VARCHAR(100) NOT NULL,
    
    -- Series details
    start_year INTEGER,
    end_year INTEGER,
    total_issues INTEGER,
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ongoing' 
        CHECK (status IN ('ongoing', 'completed', 'cancelled', 'hiatus')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_series UNIQUE (title, publisher, start_year)
);

-- Add comments
COMMENT ON TABLE series IS 'Comic series information for grouping and organization';

-- ============================================================================
-- 13. CREATE COLLECTION_GOALS TABLE (New - Gamification)
-- ============================================================================

CREATE TABLE collection_goals (
    goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Goal definition
    goal_type VARCHAR(30) NOT NULL 
        CHECK (goal_type IN ('complete_series', 'reach_value', 'collect_count', 'grade_upgrade', 'custom')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Target criteria
    target_criteria JSONB NOT NULL,
    -- Examples:
    -- {"series_id": "uuid", "issues_needed": [1,2,3,4,5]}
    -- {"target_value": 5000.00, "currency": "GBP"}
    -- {"comic_count": 1000}
    
    -- Progress tracking
    current_progress JSONB DEFAULT '{}',
    completion_percentage INTEGER DEFAULT 0 
        CHECK (completion_percentage BETWEEN 0 AND 100),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Deadlines
    target_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE collection_goals IS 'User-defined collection goals for gamification and progress tracking';

-- ============================================================================
-- 14. CREATE LOCAL_COMIC_SHOPS TABLE (New - LCS Locator)
-- ============================================================================

CREATE TABLE local_comic_shops (
    shop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) DEFAULT 'GB',
    
    -- Coordinates for distance calculation
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Social media
    social_media JSONB DEFAULT '{}', -- Twitter, Facebook, Instagram links
    
    -- Business hours
    opening_hours JSONB, -- JSON with days and hours
    -- Example: {"monday": {"open": "09:00", "close": "18:00"}, "tuesday": "closed"}
    
    -- Features
    features TEXT[], -- Array of features: ["new_comics", "back_issues", "grading", "gaming"]
    specialties TEXT[], -- What they specialize in
    
    -- User ratings
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE local_comic_shops IS 'Directory of local comic shops for the LCS locator feature';

-- ============================================================================
-- 15. CREATE MARKET_DATA TABLE (New - GoCollect Integration)
-- ============================================================================

CREATE TABLE market_data (
    data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comic_id UUID NOT NULL REFERENCES comics(comic_id) ON DELETE CASCADE,
    
    -- Market values by grade
    grade VARCHAR(10) NOT NULL,
    fair_market_value DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Historical tracking
    value_change_24h DECIMAL(10,2),
    value_change_7d DECIMAL(10,2),
    value_change_30d DECIMAL(10,2),
    value_change_percentage DECIMAL(5,2),
    
    -- Volume data
    recent_sales_count INTEGER DEFAULT 0,
    last_sale_price DECIMAL(10,2),
    last_sale_date DATE,
    
    -- Data source
    data_source VARCHAR(50) DEFAULT 'GoCollect',
    data_confidence DECIMAL(3,2) DEFAULT 1.00,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_comic_grade_data UNIQUE (comic_id, grade, data_source)
);

-- Add comments
COMMENT ON TABLE market_data IS 'Market value data from GoCollect and other sources';
COMMENT ON COLUMN market_data.data_confidence IS 'Confidence level in the market data (0.0-1.0)';

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_public_profiles ON users(profile_is_public) WHERE profile_is_public = true;

-- Comics table indexes
CREATE INDEX idx_comics_title ON comics(title);
CREATE INDEX idx_comics_publisher ON comics(publisher);
CREATE INDEX idx_comics_title_issue ON comics(title, issue_number);
CREATE INDEX idx_comics_publication_date ON comics(publication_date);
CREATE INDEX idx_comics_search_vector ON comics USING GIN(search_vector);

-- User collection indexes
CREATE INDEX idx_user_collection_user_id ON user_collection(user_id);
CREATE INDEX idx_user_collection_comic_id ON user_collection(comic_id);
CREATE INDEX idx_user_collection_purchase_date ON user_collection(purchase_date);
CREATE INDEX idx_user_collection_grade ON user_collection(grade);
CREATE INDEX idx_user_collection_for_sale ON user_collection(is_for_sale) WHERE is_for_sale = true;

-- Wishlist indexes
CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_active ON wishlist_items(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_wishlist_comic_id ON wishlist_items(comic_id);
CREATE INDEX idx_wishlist_priority ON wishlist_items(priority_level);

-- Alert settings indexes
CREATE INDEX idx_alert_settings_user ON alert_settings(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_alert_settings_want ON alert_settings(want_id, is_active) WHERE is_active = true;
CREATE INDEX idx_alert_settings_type ON alert_settings(alert_type, is_active) WHERE is_active = true;

-- Trophy system indexes
CREATE INDEX idx_user_trophies_user ON user_trophies(user_id);
CREATE INDEX idx_user_trophies_earned_date ON user_trophies(earned_date);
CREATE INDEX idx_trophies_tier ON trophies(tier);
CREATE INDEX idx_trophies_category ON trophies(category);

-- Social features indexes
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_comic_comments_comic ON comic_comments(comic_id);
CREATE INDEX idx_comic_comments_user ON comic_comments(user_id);
CREATE INDEX idx_comic_comments_created ON comic_comments(created_at);

-- eBay listings indexes
CREATE INDEX idx_ebay_listings_comic ON ebay_listings(comic_id);
CREATE INDEX idx_ebay_listings_end_time ON ebay_listings(end_time) WHERE is_tracked = true;
CREATE INDEX idx_ebay_listings_deal_score ON ebay_listings(deal_score DESC) WHERE is_tracked = true;
CREATE INDEX idx_ebay_listings_tracked ON ebay_listings(is_tracked, end_time) WHERE is_tracked = true;

-- Alert history indexes
CREATE INDEX idx_alert_history_user ON alert_history(user_id);
CREATE INDEX idx_alert_history_created ON alert_history(created_at);
CREATE INDEX idx_alert_history_type ON alert_history(alert_type);
CREATE INDEX idx_alert_history_status ON alert_history(delivery_status);

-- Market data indexes
CREATE INDEX idx_market_data_comic ON market_data(comic_id);
CREATE INDEX idx_market_data_grade ON market_data(grade);
CREATE INDEX idx_market_data_updated ON market_data(updated_at);

-- Geographic indexes for LCS
CREATE INDEX idx_lcs_location ON local_comic_shops USING GIST(
    ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comics_updated_at BEFORE UPDATE ON comics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collection_updated_at BEFORE UPDATE ON user_collection
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at BEFORE UPDATE ON wishlist_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_settings_updated_at BEFORE UPDATE ON alert_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update search vector for comics
CREATE OR REPLACE FUNCTION update_comics_search_vector()
RETURNS TRIGGER AS $
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.publisher, '') || ' ' || 
        COALESCE(NEW.description, '')
    );
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_comics_search_vector_trigger
    BEFORE INSERT OR UPDATE ON comics
    FOR EACH ROW EXECUTE FUNCTION update_comics_search_vector();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable RLS on user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be customized based on Supabase Auth)
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = user_id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = user_id::text);

-- Public profiles are visible to all authenticated users
CREATE POLICY "Public profiles visible" ON users
    FOR SELECT USING (profile_is_public = true);

-- User collection policies
CREATE POLICY "Users can manage own collection" ON user_collection
    FOR ALL USING (auth.uid() = user_id::text);

-- Public collections visible to followers
CREATE POLICY "Public collections visible" ON user_collection
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = user_collection.user_id 
            AND users.profile_is_public = true
        )
    );

-- ============================================================================
-- DEFAULT DATA INSERTION
-- ============================================================================

-- Insert default trophy definitions
INSERT INTO trophies (name, description, tier, rules, points_value, category, icon_url) VALUES
('First Comic', 'Add your first comic to your collection', 'bronze', '{"type": "collection_count", "threshold": 1}', 10, 'Collector', '/icons/trophy-first-comic.svg'),
('Century Club', 'Own 100 comics in your collection', 'silver', '{"type": "collection_count", "threshold": 100}', 50, 'Collector', '/icons/trophy-century.svg'),
('Thousand Club', 'Own 1,000 comics in your collection', 'gold', '{"type": "collection_count", "threshold": 1000}', 200, 'Collector', '/icons/trophy-thousand.svg'),
('High Roller', 'Collection value exceeds £1,000', 'silver', '{"type": "collection_value", "threshold": 1000, "currency": "GBP"}', 75, 'Investor', '/icons/trophy-high-roller.svg'),
('Big Spender', 'Collection value exceeds £10,000', 'gold', '{"type": "collection_value", "threshold": 10000, "currency": "GBP"}', 300, 'Investor', '/icons/trophy-big-spender.svg'),
('Graded Collector', 'Own 10 graded comics', 'bronze', '{"type": "graded_count", "threshold": 10}', 25, 'Collector', '/icons/trophy-graded.svg'),
('Social Butterfly', 'Follow 25 other collectors', 'bronze', '{"type": "following_count", "threshold": 25}', 15, 'Social', '/icons/trophy-social.svg'),
('Profit Master', 'Make £500 profit on a single comic', 'gold', '{"type": "single_profit", "threshold": 500, "currency": "GBP"}', 100, 'Investor', '/icons/trophy-profit.svg');

-- Insert sample alert setting templates
INSERT INTO alert_settings (user_id, alert_type, threshold, notification_methods) 
SELECT 
    gen_random_uuid(), -- This will be overridden by actual user IDs
    'new_deal',
    '{"percentage_below_fmv": 20}',
    '["email"]'
WHERE FALSE; -- Don't actually insert, just define the structure

-- ============================================================================
-- COMPLETION SUMMARY
-- ============================================================================

DO $
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'TABLE CREATION COMPLETION SUMMARY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Core Tables Created:';
    RAISE NOTICE '  - users (enhanced with social features)';
    RAISE NOTICE '  - comics (enhanced with market data)';
    RAISE NOTICE '  - user_collection (enhanced with profit tracking)';
    RAISE NOTICE '';
    RAISE NOTICE 'New Feature Tables Created:';
    RAISE NOTICE '  - wishlist_items (scouting system)';
    RAISE NOTICE '  - alert_settings (alert system)';
    RAISE NOTICE '  - trophies & user_trophies (gamification)';
    RAISE NOTICE '  - user_follows & comic_comments (social features)';
    RAISE NOTICE '  - ebay_listings & alert_history (scouting engine)';
    RAISE NOTICE '  - local_comic_shops (LCS locator)';
    RAISE NOTICE '  - market_data (GoCollect integration)';
    RAISE NOTICE '  - collection_goals (goal tracking)';
    RAISE NOTICE '';
    RAISE NOTICE 'Performance Optimizations:';
    RAISE NOTICE '  - % indexes created for critical queries', 
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
    RAISE NOTICE '  - Full-text search enabled on comics';
    RAISE NOTICE '  - Automatic timestamp updates configured';
    RAISE NOTICE '  - Row Level Security enabled for user data';
    RAISE NOTICE '';
    RAISE NOTICE 'Default Data:';
    RAISE NOTICE '  - % trophy definitions inserted', 
        (SELECT COUNT(*) FROM trophies);
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Run data migration script (003_migrate_existing_data.sql)';
    RAISE NOTICE '  2. Validate data integrity';
    RAISE NOTICE '  3. Test application connectivity';
    RAISE NOTICE '============================================================================';
END $;

-- End of script
RAISE NOTICE 'Schema creation script 002_create_new_tables.sql completed successfully at %', NOW();
