-- =====================================================
-- Phase 2: Database Migration - Migrate Existing Data
-- File: 003_migrate_existing_data.sql
-- Description: Migrate and transform existing data to new schema structures
-- =====================================================

-- =====================================================
-- DATA MIGRATION PROCEDURES
-- =====================================================

-- Function to migrate publishers from comic_series
CREATE OR REPLACE FUNCTION migrate_publishers_data()
RETURNS TEXT AS $$
DECLARE
    publishers_migrated INTEGER := 0;
    series_updated INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Insert unique publishers from comic_series
    INSERT INTO publishers (name, created_at, updated_at)
    SELECT DISTINCT 
        publisher,
        MIN(created_at) as created_at,
        MAX(updated_at) as updated_at
    FROM comic_series
    WHERE publisher IS NOT NULL 
      AND publisher != ''
      AND publisher NOT IN (SELECT name FROM publishers)
    GROUP BY publisher;
    
    GET DIAGNOSTICS publishers_migrated = ROW_COUNT;
    
    -- Create publisher_id column in comic_series if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'comic_series' AND column_name = 'publisher_id'
        ) THEN
            ALTER TABLE comic_series ADD COLUMN publisher_id UUID REFERENCES publishers(id);
        END IF;
    END
    $$;
    
    -- Update comic_series with publisher_id references
    UPDATE comic_series 
    SET publisher_id = p.id
    FROM publishers p
    WHERE comic_series.publisher = p.name
      AND comic_series.publisher_id IS NULL;
    
    GET DIAGNOSTICS series_updated = ROW_COUNT;
    
    result_message := format(
        'Publishers migration completed: %s publishers created, %s series updated',
        publishers_migrated, series_updated
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing grading data to enhanced format
CREATE OR REPLACE FUNCTION migrate_grading_enhancements()
RETURNS TEXT AS $$
DECLARE
    descriptors_created INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Insert common condition descriptors for existing grades
    INSERT INTO condition_descriptors (grade_id, descriptor_type, condition_detail, severity, affects_value, value_impact_percentage)
    SELECT 
        gs.id,
        'general'::TEXT,
        CASE 
            WHEN gs.grade_value >= 9.0 THEN 'Near perfect condition with minimal wear'
            WHEN gs.grade_value >= 8.0 THEN 'Very fine condition with minor flaws'
            WHEN gs.grade_value >= 6.0 THEN 'Fine condition with moderate wear'
            WHEN gs.grade_value >= 4.0 THEN 'Good condition with noticeable flaws'
            ELSE 'Poor condition with significant damage'
        END,
        CASE 
            WHEN gs.grade_value >= 8.0 THEN 'minor'::TEXT
            WHEN gs.grade_value >= 6.0 THEN 'moderate'::TEXT
            ELSE 'major'::TEXT
        END,
        TRUE,
        CASE 
            WHEN gs.grade_value >= 9.0 THEN 0.0
            WHEN gs.grade_value >= 8.0 THEN 5.0
            WHEN gs.grade_value >= 6.0 THEN 15.0
            WHEN gs.grade_value >= 4.0 THEN 35.0
            ELSE 50.0
        END
    FROM grading_standards gs
    WHERE gs.is_active = TRUE
      AND NOT EXISTS (
          SELECT 1 FROM condition_descriptors cd 
          WHERE cd.grade_id = gs.id AND cd.descriptor_type = 'general'
      );
    
    GET DIAGNOSTICS descriptors_created = ROW_COUNT;
    
    result_message := format(
        'Grading enhancements migration completed: %s condition descriptors created',
        descriptors_created
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing pricing data to price history
CREATE OR REPLACE FUNCTION migrate_price_history()
RETURNS TEXT AS $$
DECLARE
    price_records_created INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Migrate normalized listings to price history for completed sales
    INSERT INTO price_history (
        series_id, issue_id, grade_id, price, sale_date, sale_type, 
        source, source_listing_id, transaction_fees, created_at
    )
    SELECT DISTINCT
        nl.series_id,
        nl.issue_id,
        nl.grade_id,
        nl.total_cost,
        COALESCE(nl.ends_at::DATE, nl.created_at::DATE) as sale_date,
        COALESCE(nl.auction_type, 'unknown') as sale_type,
        COALESCE(rl.source, 'unknown') as source,
        rl.source_listing_id,
        nl.shipping_cost,
        nl.created_at
    FROM normalized_listings nl
    LEFT JOIN raw_listings rl ON nl.raw_listing_id = rl.id
    WHERE nl.ends_at < NOW() -- Only completed listings
      AND nl.total_cost > 0
      AND NOT EXISTS (
          SELECT 1 FROM price_history ph 
          WHERE ph.series_id = nl.series_id 
            AND ph.issue_id = nl.issue_id 
            AND ph.grade_id = nl.grade_id
            AND ph.source_listing_id = rl.source_listing_id
      );
    
    GET DIAGNOSTICS price_records_created = ROW_COUNT;
    
    result_message := format(
        'Price history migration completed: %s price records created',
        price_records_created
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to create default user preferences for existing users
CREATE OR REPLACE FUNCTION migrate_user_preferences()
RETURNS TEXT AS $$
DECLARE
    preferences_created INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Create default preferences for existing users
    INSERT INTO user_preferences (
        user_id, default_currency, preferred_grading_companies,
        email_notifications, push_notifications, public_collection,
        advanced_analytics, created_at, updated_at
    )
    SELECT 
        u.id,
        'GBP'::TEXT,
        ARRAY['CGC', 'CBCS']::TEXT[],
        TRUE,
        TRUE,
        FALSE,
        FALSE,
        u.created_at,
        NOW()
    FROM users u
    WHERE NOT EXISTS (
        SELECT 1 FROM user_preferences up WHERE up.user_id = u.id
    );
    
    GET DIAGNOSTICS preferences_created = ROW_COUNT;
    
    result_message := format(
        'User preferences migration completed: %s preference records created',
        preferences_created
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing deals to enhanced format with tags
CREATE OR REPLACE FUNCTION migrate_deals_enhancements()
RETURNS TEXT AS $$
DECLARE
    tags_created INTEGER := 0;
    tag_assignments_created INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Create system tags based on existing deal types
    INSERT INTO deal_tags (name, description, color_hex, is_system_tag)
    VALUES 
        ('Underpriced', 'Deals significantly below market value', '#EF4444', TRUE),
        ('Auction Ending', 'Auctions ending soon with low bids', '#F59E0B', TRUE),
        ('Key Issue', 'Important milestone issues', '#8B5CF6', TRUE),
        ('High Volume', 'Issues with many recent sales', '#10B981', TRUE),
        ('Price Drop', 'Recent significant price decreases', '#3B82F6', TRUE),
        ('New Listing', 'Recently listed items', '#6B7280', TRUE)
    ON CONFLICT (name) DO NOTHING;
    
    GET DIAGNOSTICS tags_created = ROW_COUNT;
    
    -- Assign tags to existing deals based on deal_type
    INSERT INTO deal_tag_assignments (deal_id, tag_id)
    SELECT DISTINCT
        d.id,
        dt.id
    FROM deals d
    CROSS JOIN deal_tags dt
    WHERE (
        (d.deal_type = 'underpriced' AND dt.name = 'Underpriced') OR
        (d.deal_type = 'auction_ending' AND dt.name = 'Auction Ending') OR
        (d.deal_type = 'key_issue' AND dt.name = 'Key Issue') OR
        (d.deal_type LIKE '%volume%' AND dt.name = 'High Volume') OR
        (d.deal_type LIKE '%price%' AND dt.name = 'Price Drop')
    )
    AND NOT EXISTS (
        SELECT 1 FROM deal_tag_assignments dta 
        WHERE dta.deal_id = d.id AND dta.tag_id = dt.id
    );
    
    GET DIAGNOSTICS tag_assignments_created = ROW_COUNT;
    
    result_message := format(
        'Deals enhancements migration completed: %s tags created, %s tag assignments made',
        tags_created, tag_assignments_created
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to generate initial market trends from existing market values
CREATE OR REPLACE FUNCTION generate_initial_market_trends()
RETURNS TEXT AS $$
DECLARE
    trends_created INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Generate 30-day trends from existing market values
    INSERT INTO market_trends (
        series_id, issue_id, grade_id, trend_period, 
        price_change_percentage, period_start_date, period_end_date,
        transaction_count, analysis_date
    )
    SELECT 
        mv.series_id,
        mv.issue_id,
        mv.grade_id,
        '30d'::TEXT,
        COALESCE(mv.price_trend_30d, 0.0),
        (CURRENT_DATE - INTERVAL '30 days')::DATE,
        CURRENT_DATE,
        COALESCE(mv.sample_count, 0),
        NOW()
    FROM market_values mv
    WHERE mv.sample_count > 0
      AND NOT EXISTS (
          SELECT 1 FROM market_trends mt 
          WHERE mt.series_id = mv.series_id 
            AND mt.issue_id = mv.issue_id 
            AND mt.grade_id = mv.grade_id
            AND mt.trend_period = '30d'
      );
    
    GET DIAGNOSTICS trends_created = ROW_COUNT;
    
    result_message := format(
        'Initial market trends generation completed: %s trend records created',
        trends_created
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- Function to populate popular searches from existing data
CREATE OR REPLACE FUNCTION populate_popular_searches()
RETURNS TEXT AS $$
DECLARE
    searches_created INTEGER := 0;
    result_message TEXT;
BEGIN
    -- Populate with series names
    INSERT INTO popular_searches (search_term, search_category, search_count)
    SELECT 
        cs.name,
        'series'::TEXT,
        GREATEST(1, FLOOR(RANDOM() * 50 + 1)::INTEGER) -- Random initial popularity
    FROM comic_series cs
    WHERE LENGTH(cs.name) >= 3
      AND NOT EXISTS (
          SELECT 1 FROM popular_searches ps 
          WHERE ps.search_term = cs.name AND ps.search_category = 'series'
      )
    LIMIT 100; -- Limit initial population
    
    -- Populate with publisher names
    INSERT INTO popular_searches (search_term, search_category, search_count)
    SELECT 
        p.name,
        'publisher'::TEXT,
        GREATEST(1, FLOOR(RANDOM() * 30 + 1)::INTEGER)
    FROM publishers p
    WHERE LENGTH(p.name) >= 2
      AND NOT EXISTS (
          SELECT 1 FROM popular_searches ps 
          WHERE ps.search_term = p.name AND ps.search_category = 'publisher'
      )
    LIMIT 50;
    
    GET DIAGNOSTICS searches_created = ROW_COUNT;
    
    result_message := format(
        'Popular searches population completed: %s search terms created',
        searches_created
    );
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MASTER MIGRATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION execute_data_migration()
RETURNS TABLE(
    migration_step TEXT,
    result_message TEXT,
    execution_time INTERVAL
) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    step_result TEXT;
BEGIN
    -- Step 1: Migrate Publishers
    start_time := NOW();
    SELECT migrate_publishers_data() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'Publishers Migration'::TEXT, step_result, (end_time - start_time);
    
    -- Step 2: Migrate Grading Enhancements
    start_time := NOW();
    SELECT migrate_grading_enhancements() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'Grading Enhancements'::TEXT, step_result, (end_time - start_time);
    
    -- Step 3: Migrate Price History
    start_time := NOW();
    SELECT migrate_price_history() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'Price History Migration'::TEXT, step_result, (end_time - start_time);
    
    -- Step 4: Migrate User Preferences
    start_time := NOW();
    SELECT migrate_user_preferences() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'User Preferences Migration'::TEXT, step_result, (end_time - start_time);
    
    -- Step 5: Migrate Deals Enhancements
    start_time := NOW();
    SELECT migrate_deals_enhancements() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'Deals Enhancements'::TEXT, step_result, (end_time - start_time);
    
    -- Step 6: Generate Initial Market Trends
    start_time := NOW();
    SELECT generate_initial_market_trends() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'Market Trends Generation'::TEXT, step_result, (end_time - start_time);
    
    -- Step 7: Populate Popular Searches
    start_time := NOW();
    SELECT populate_popular_searches() INTO step_result;
    end_time := NOW();
    
    RETURN QUERY SELECT 'Popular Searches Population'::TEXT, step_result, (end_time - start_time);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATA INTEGRITY CHECKS
-- =====================================================

CREATE OR REPLACE FUNCTION validate_data_migration()
RETURNS TABLE(
    check_name TEXT,
    table_name TEXT,
    expected_count BIGINT,
    actual_count BIGINT,
    status TEXT
) AS $$
BEGIN
    -- Check publishers migration
    RETURN QUERY
    SELECT 
        'Publishers Created'::TEXT,
        'publishers'::TEXT,
        (SELECT COUNT(DISTINCT publisher) FROM comic_series WHERE publisher IS NOT NULL)::BIGINT,
        (SELECT COUNT(*) FROM publishers)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM publishers) >= (SELECT COUNT(DISTINCT publisher) FROM comic_series WHERE publisher IS NOT NULL) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check condition descriptors
    RETURN QUERY
    SELECT 
        'Condition Descriptors'::TEXT,
        'condition_descriptors'::TEXT,
        (SELECT COUNT(*) FROM grading_standards WHERE is_active = TRUE)::BIGINT,
        (SELECT COUNT(*) FROM condition_descriptors)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM condition_descriptors) >= (SELECT COUNT(*) FROM grading_standards WHERE is_active = TRUE) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check user preferences
    RETURN QUERY
    SELECT 
        'User Preferences'::TEXT,
        'user_preferences'::TEXT,
        (SELECT COUNT(*) FROM users)::BIGINT,
        (SELECT COUNT(*) FROM user_preferences)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM user_preferences) = (SELECT COUNT(*) FROM users) 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check deal tags
    RETURN QUERY
    SELECT 
        'Deal System Tags'::TEXT,
        'deal_tags'::TEXT,
        6::BIGINT, -- Expected system tags
        (SELECT COUNT(*) FROM deal_tags WHERE is_system_tag = TRUE)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM deal_tags WHERE is_system_tag = TRUE) >= 6 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
END;
$$ LANGUAGE plpgsql;

-- Log completion
INSERT INTO migration_log (migration_file, status, completed_at) 
VALUES ('003_migrate_existing_data.sql', 'completed', NOW());