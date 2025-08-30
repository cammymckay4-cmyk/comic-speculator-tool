-- =====================================================
-- Phase 2: Database Migration - Backup Critical Data
-- File: 001_backup_critical_data.sql
-- Description: Create backup tables for critical user data before schema changes
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BACKUP TABLES FOR CRITICAL DATA
-- =====================================================

-- Backup existing users data
CREATE TABLE IF NOT EXISTS backup_users (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id UUID,
    email TEXT,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_active BOOLEAN,
    last_login TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup existing comic series data
CREATE TABLE IF NOT EXISTS backup_comic_series (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id UUID,
    name TEXT,
    aliases TEXT[],
    publisher TEXT,
    publication_start_date DATE,
    publication_end_date DATE,
    description TEXT,
    image_url TEXT,
    genre TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup existing comic issues data
CREATE TABLE IF NOT EXISTS backup_comic_issues (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id UUID,
    series_id UUID,
    issue_number TEXT,
    variant TEXT,
    release_date DATE,
    key_issue BOOLEAN,
    key_issue_notes TEXT,
    cover_image_url TEXT,
    synopsis TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup existing user collections data
CREATE TABLE IF NOT EXISTS backup_user_collections (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id UUID,
    user_id UUID,
    series_id UUID,
    issue_id UUID,
    grade_id UUID,
    acquisition_date DATE,
    acquisition_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    notes TEXT,
    condition_notes TEXT,
    storage_location TEXT,
    is_wishlist_item BOOLEAN,
    personal_rating INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup existing user alert rules data
CREATE TABLE IF NOT EXISTS backup_user_alert_rules (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id UUID,
    user_id UUID,
    series_id UUID,
    issue_id UUID,
    grade_id UUID,
    max_price DECIMAL(10,2),
    min_deal_score DECIMAL(5,2),
    auction_types TEXT[],
    is_active BOOLEAN,
    notification_email BOOLEAN,
    notification_frequency TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup existing market values data
CREATE TABLE IF NOT EXISTS backup_market_values (
    backup_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_id UUID,
    series_id UUID,
    issue_id UUID,
    grade_id UUID,
    sample_count INTEGER,
    median_price DECIMAL(10,2),
    mean_price DECIMAL(10,2),
    stddev_price DECIMAL(10,2),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    price_trend_30d DECIMAL(5,2),
    price_trend_90d DECIMAL(5,2),
    calculation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    backup_created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BACKUP PROCEDURES
-- =====================================================

-- Function to perform complete data backup
CREATE OR REPLACE FUNCTION backup_critical_data()
RETURNS TEXT AS $$
DECLARE
    users_count INTEGER;
    series_count INTEGER;
    issues_count INTEGER;
    collections_count INTEGER;
    alerts_count INTEGER;
    market_values_count INTEGER;
    result_message TEXT;
BEGIN
    -- Clear existing backup data
    TRUNCATE TABLE backup_users, backup_comic_series, backup_comic_issues, 
                   backup_user_collections, backup_user_alert_rules, backup_market_values;
    
    -- Backup users
    INSERT INTO backup_users (
        original_id, email, username, first_name, last_name, profile_image_url,
        created_at, updated_at, is_active, last_login
    )
    SELECT id, email, username, first_name, last_name, profile_image_url,
           created_at, updated_at, is_active, last_login
    FROM users;
    
    GET DIAGNOSTICS users_count = ROW_COUNT;
    
    -- Backup comic series
    INSERT INTO backup_comic_series (
        original_id, name, aliases, publisher, publication_start_date, publication_end_date,
        description, image_url, genre, created_at, updated_at
    )
    SELECT id, name, aliases, publisher, publication_start_date, publication_end_date,
           description, image_url, genre, created_at, updated_at
    FROM comic_series;
    
    GET DIAGNOSTICS series_count = ROW_COUNT;
    
    -- Backup comic issues
    INSERT INTO backup_comic_issues (
        original_id, series_id, issue_number, variant, release_date, key_issue, key_issue_notes,
        cover_image_url, synopsis, created_at, updated_at
    )
    SELECT id, series_id, issue_number, variant, release_date, key_issue, key_issue_notes,
           cover_image_url, synopsis, created_at, updated_at
    FROM comic_issues;
    
    GET DIAGNOSTICS issues_count = ROW_COUNT;
    
    -- Backup user collections
    INSERT INTO backup_user_collections (
        original_id, user_id, series_id, issue_id, grade_id, acquisition_date, acquisition_price,
        current_value, notes, condition_notes, storage_location, is_wishlist_item, personal_rating,
        created_at, updated_at
    )
    SELECT id, user_id, series_id, issue_id, grade_id, acquisition_date, acquisition_price,
           current_value, notes, condition_notes, storage_location, is_wishlist_item, personal_rating,
           created_at, updated_at
    FROM user_collections;
    
    GET DIAGNOSTICS collections_count = ROW_COUNT;
    
    -- Backup user alert rules
    INSERT INTO backup_user_alert_rules (
        original_id, user_id, series_id, issue_id, grade_id, max_price, min_deal_score,
        auction_types, is_active, notification_email, notification_frequency, created_at, updated_at
    )
    SELECT id, user_id, series_id, issue_id, grade_id, max_price, min_deal_score,
           auction_types, is_active, notification_email, notification_frequency, created_at, updated_at
    FROM user_alert_rules;
    
    GET DIAGNOSTICS alerts_count = ROW_COUNT;
    
    -- Backup market values
    INSERT INTO backup_market_values (
        original_id, series_id, issue_id, grade_id, sample_count, median_price, mean_price,
        stddev_price, min_price, max_price, price_trend_30d, price_trend_90d,
        calculation_date, created_at, updated_at
    )
    SELECT id, series_id, issue_id, grade_id, sample_count, median_price, mean_price,
           stddev_price, min_price, max_price, price_trend_30d, price_trend_90d,
           calculation_date, created_at, updated_at
    FROM market_values;
    
    GET DIAGNOSTICS market_values_count = ROW_COUNT;
    
    result_message := format(
        'Backup completed successfully. Records backed up: Users=%s, Series=%s, Issues=%s, Collections=%s, Alerts=%s, Market Values=%s',
        users_count, series_count, issues_count, collections_count, alerts_count, market_values_count
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BACKUP VERIFICATION FUNCTIONS
-- =====================================================

-- Function to verify backup integrity
CREATE OR REPLACE FUNCTION verify_backup_integrity()
RETURNS TABLE(
    table_name TEXT,
    original_count BIGINT,
    backup_count BIGINT,
    integrity_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'users'::TEXT,
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM backup_users),
        CASE 
            WHEN (SELECT COUNT(*) FROM users) = (SELECT COUNT(*) FROM backup_users) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    RETURN QUERY
    SELECT 
        'comic_series'::TEXT,
        (SELECT COUNT(*) FROM comic_series),
        (SELECT COUNT(*) FROM backup_comic_series),
        CASE 
            WHEN (SELECT COUNT(*) FROM comic_series) = (SELECT COUNT(*) FROM backup_comic_series) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    RETURN QUERY
    SELECT 
        'comic_issues'::TEXT,
        (SELECT COUNT(*) FROM comic_issues),
        (SELECT COUNT(*) FROM backup_comic_issues),
        CASE 
            WHEN (SELECT COUNT(*) FROM comic_issues) = (SELECT COUNT(*) FROM backup_comic_issues) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    RETURN QUERY
    SELECT 
        'user_collections'::TEXT,
        (SELECT COUNT(*) FROM user_collections),
        (SELECT COUNT(*) FROM backup_user_collections),
        CASE 
            WHEN (SELECT COUNT(*) FROM user_collections) = (SELECT COUNT(*) FROM backup_user_collections) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    RETURN QUERY
    SELECT 
        'user_alert_rules'::TEXT,
        (SELECT COUNT(*) FROM user_alert_rules),
        (SELECT COUNT(*) FROM backup_user_alert_rules),
        CASE 
            WHEN (SELECT COUNT(*) FROM user_alert_rules) = (SELECT COUNT(*) FROM backup_user_alert_rules) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    RETURN QUERY
    SELECT 
        'market_values'::TEXT,
        (SELECT COUNT(*) FROM market_values),
        (SELECT COUNT(*) FROM backup_market_values),
        CASE 
            WHEN (SELECT COUNT(*) FROM market_values) = (SELECT COUNT(*) FROM backup_market_values) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR BACKUP TABLES (for faster restoration if needed)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_backup_users_original_id ON backup_users (original_id);
CREATE INDEX IF NOT EXISTS idx_backup_comic_series_original_id ON backup_comic_series (original_id);
CREATE INDEX IF NOT EXISTS idx_backup_comic_issues_original_id ON backup_comic_issues (original_id);
CREATE INDEX IF NOT EXISTS idx_backup_user_collections_original_id ON backup_user_collections (original_id);
CREATE INDEX IF NOT EXISTS idx_backup_user_alert_rules_original_id ON backup_user_alert_rules (original_id);
CREATE INDEX IF NOT EXISTS idx_backup_market_values_original_id ON backup_market_values (original_id);

-- Log completion
INSERT INTO public.migration_log (migration_file, status, completed_at) 
VALUES ('001_backup_critical_data.sql', 'completed', NOW())
ON CONFLICT DO NOTHING;