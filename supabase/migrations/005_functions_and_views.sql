-- =====================================================
-- ComicScoutUK Database Migration: Business Logic Functions & Views
-- File: 005_functions_and_views.sql
-- Description: Utility functions and optimized views for common application queries
-- =====================================================

-- =====================================================
-- DEAL SCORING FUNCTIONS
-- =====================================================

-- Function to calculate deal score based on market value comparison
CREATE OR REPLACE FUNCTION calculate_deal_score(
    listing_price DECIMAL(10,2),
    market_median DECIMAL(10,2),
    market_stddev DECIMAL(10,2) DEFAULT NULL,
    sample_count INTEGER DEFAULT 0
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    base_score DECIMAL(5,2);
    confidence_multiplier DECIMAL(3,2) := 1.0;
    final_score DECIMAL(5,2);
BEGIN
    -- Return 0 if no market data
    IF market_median IS NULL OR market_median <= 0 THEN
        RETURN 0.0;
    END IF;
    
    -- Calculate base score (percentage below market value)
    base_score := (1 - (listing_price / market_median)) * 100;
    
    -- Apply confidence multiplier based on sample size
    IF sample_count >= 50 THEN
        confidence_multiplier := 1.0;
    ELSIF sample_count >= 25 THEN
        confidence_multiplier := 0.9;
    ELSIF sample_count >= 10 THEN
        confidence_multiplier := 0.8;
    ELSIF sample_count >= 5 THEN
        confidence_multiplier := 0.7;
    ELSE
        confidence_multiplier := 0.6;
    END IF;
    
    -- Apply standard deviation bonus (lower volatility = higher confidence)
    IF market_stddev IS NOT NULL AND market_stddev > 0 THEN
        -- If standard deviation is low relative to median, boost score slightly
        IF (market_stddev / market_median) < 0.15 THEN
            confidence_multiplier := confidence_multiplier + 0.1;
        END IF;
    END IF;
    
    final_score := base_score * confidence_multiplier;
    
    -- Cap score between 0 and 100
    RETURN GREATEST(0.0, LEAST(100.0, final_score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to determine deal type based on characteristics  
CREATE OR REPLACE FUNCTION classify_deal_type(
    deal_score DECIMAL(5,2),
    auction_type TEXT,
    ends_at TIMESTAMPTZ DEFAULT NULL,
    key_issue BOOLEAN DEFAULT FALSE
)
RETURNS TEXT AS $$
BEGIN
    -- Key issue deals get priority classification
    IF key_issue = TRUE AND deal_score >= 60.0 THEN
        RETURN 'key_issue';
    END IF;
    
    -- Auction ending soon
    IF auction_type = 'auction' AND ends_at IS NOT NULL AND ends_at <= NOW() + INTERVAL '6 hours' THEN
        RETURN 'auction_ending';
    END IF;
    
    -- High-score underpriced deals
    IF deal_score >= 80.0 THEN
        RETURN 'underpriced';
    END IF;
    
    -- Moderate deals
    IF deal_score >= 60.0 THEN
        RETURN 'good_value';
    END IF;
    
    -- Default
    RETURN 'moderate';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- SEARCH FUNCTIONS
-- =====================================================

-- Function to search comic series by name or alias
CREATE OR REPLACE FUNCTION search_comic_series(search_term TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    publisher TEXT,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.name,
        cs.publisher,
        CASE 
            -- Exact name match gets highest score
            WHEN LOWER(cs.name) = LOWER(search_term) THEN 100
            -- Name starts with search term
            WHEN LOWER(cs.name) LIKE LOWER(search_term || '%') THEN 90
            -- Name contains search term
            WHEN LOWER(cs.name) LIKE '%' || LOWER(search_term) || '%' THEN 80
            -- Exact alias match
            WHEN EXISTS(SELECT 1 FROM unnest(cs.aliases) alias WHERE LOWER(alias) = LOWER(search_term)) THEN 95
            -- Alias starts with search term  
            WHEN EXISTS(SELECT 1 FROM unnest(cs.aliases) alias WHERE LOWER(alias) LIKE LOWER(search_term || '%')) THEN 85
            -- Alias contains search term
            WHEN EXISTS(SELECT 1 FROM unnest(cs.aliases) alias WHERE LOWER(alias) LIKE '%' || LOWER(search_term) || '%') THEN 75
            ELSE 0
        END as match_score
    FROM comic_series cs
    WHERE 
        LOWER(cs.name) LIKE '%' || LOWER(search_term) || '%'
        OR EXISTS(SELECT 1 FROM unnest(cs.aliases) alias WHERE LOWER(alias) LIKE '%' || LOWER(search_term) || '%')
    ORDER BY match_score DESC, cs.name
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- ALERT MATCHING FUNCTIONS
-- =====================================================

-- Function to find users who should be alerted about a deal
CREATE OR REPLACE FUNCTION get_matching_alert_rules(
    p_series_id UUID,
    p_issue_id UUID DEFAULT NULL,
    p_grade_id UUID DEFAULT NULL,
    p_deal_score DECIMAL(5,2) DEFAULT NULL,
    p_listing_price DECIMAL(10,2) DEFAULT NULL,
    p_auction_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    alert_rule_id UUID,
    user_id UUID,
    user_email TEXT,
    notification_frequency TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uar.id as alert_rule_id,
        uar.user_id,
        u.email as user_email,
        uar.notification_frequency
    FROM user_alert_rules uar
    JOIN users u ON uar.user_id = u.id
    WHERE 
        uar.is_active = TRUE
        AND u.is_active = TRUE
        -- Series must match
        AND uar.series_id = p_series_id
        -- Issue match (if specified in alert rule)
        AND (uar.issue_id IS NULL OR uar.issue_id = p_issue_id)
        -- Grade match (if specified in alert rule)  
        AND (uar.grade_id IS NULL OR uar.grade_id = p_grade_id)
        -- Price limit check
        AND (uar.max_price IS NULL OR p_listing_price IS NULL OR p_listing_price <= uar.max_price)
        -- Deal score threshold
        AND (uar.min_deal_score IS NULL OR p_deal_score IS NULL OR p_deal_score >= uar.min_deal_score)
        -- Auction type filter
        AND (uar.auction_types IS NULL OR p_auction_type IS NULL OR p_auction_type = ANY(uar.auction_types));
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to clean up expired deals
CREATE OR REPLACE FUNCTION cleanup_expired_deals()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark deals as inactive if their associated listings have ended
    UPDATE deals 
    SET is_active = FALSE, updated_at = NOW()
    WHERE is_active = TRUE
    AND id IN (
        SELECT d.id 
        FROM deals d
        JOIN normalized_listings nl ON d.normalized_listing_id = nl.id
        WHERE nl.ends_at IS NOT NULL AND nl.ends_at < NOW()
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update market values based on recent listings
CREATE OR REPLACE FUNCTION update_market_values_for_issue(
    p_series_id UUID,
    p_issue_id UUID,
    p_grade_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    stats_record RECORD;
BEGIN
    -- Calculate statistics from recent normalized listings
    SELECT 
        COUNT(*) as sample_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_cost) as median_price,
        AVG(total_cost) as mean_price,
        STDDEV(total_cost) as stddev_price,
        MIN(total_cost) as min_price,
        MAX(total_cost) as max_price
    INTO stats_record
    FROM normalized_listings nl
    WHERE 
        nl.series_id = p_series_id
        AND nl.issue_id = p_issue_id  
        AND nl.grade_id = p_grade_id
        AND nl.created_at >= NOW() - INTERVAL '90 days'
        AND nl.total_cost > 0;
    
    -- Only update if we have sufficient data
    IF stats_record.sample_count >= 3 THEN
        INSERT INTO market_values (
            series_id, issue_id, grade_id,
            sample_count, median_price, mean_price, stddev_price, min_price, max_price,
            calculation_date
        ) VALUES (
            p_series_id, p_issue_id, p_grade_id,
            stats_record.sample_count, stats_record.median_price, stats_record.mean_price,
            stats_record.stddev_price, stats_record.min_price, stats_record.max_price,
            NOW()
        )
        ON CONFLICT (series_id, issue_id, grade_id)
        DO UPDATE SET
            sample_count = EXCLUDED.sample_count,
            median_price = EXCLUDED.median_price,
            mean_price = EXCLUDED.mean_price,
            stddev_price = EXCLUDED.stddev_price,
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            calculation_date = EXCLUDED.calculation_date,
            updated_at = NOW();
            
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- OPTIMIZED VIEWS
-- =====================================================

-- View for active deals with full context
CREATE OR REPLACE VIEW active_deals_detailed AS
SELECT 
    d.id as deal_id,
    d.deal_score,
    d.potential_profit,
    d.profit_percentage,
    d.deal_type,
    d.confidence_level,
    d.expires_at,
    d.created_at as deal_created_at,
    
    -- Listing details
    nl.id as listing_id,
    nl.title as listing_title,
    nl.price as listing_price,
    nl.shipping_cost,
    nl.total_cost as listing_total_cost,
    nl.seller_name,
    nl.seller_feedback_score,
    nl.auction_type,
    nl.ends_at as listing_ends_at,
    nl.listing_url,
    nl.is_graded,
    nl.grade_notes,
    
    -- Comic details
    cs.name as series_name,
    cs.publisher,
    ci.issue_number,
    ci.variant,
    ci.key_issue,
    ci.key_issue_notes,
    
    -- Grade details
    gs.company as grade_company,
    gs.grade_label,
    gs.grade_value,
    
    -- Market value context
    mv.median_price as market_median,
    mv.sample_count as market_sample_count
    
FROM deals d
JOIN normalized_listings nl ON d.normalized_listing_id = nl.id
JOIN comic_series cs ON nl.series_id = cs.id
JOIN comic_issues ci ON nl.issue_id = ci.id
LEFT JOIN grading_standards gs ON nl.grade_id = gs.id
LEFT JOIN market_values mv ON d.market_value_id = mv.id
WHERE d.is_active = TRUE;

-- View for user collections with current market context
CREATE OR REPLACE VIEW user_collections_valued AS
SELECT 
    uc.id as collection_id,
    uc.user_id,
    uc.acquisition_date,
    uc.acquisition_price,
    uc.current_value,
    uc.notes,
    uc.personal_rating,
    uc.is_wishlist_item,
    
    -- Comic details
    cs.name as series_name,
    cs.publisher,
    ci.issue_number,
    ci.variant,
    ci.key_issue,
    ci.key_issue_notes,
    
    -- Grade details  
    gs.company as grade_company,
    gs.grade_label,
    gs.grade_value,
    
    -- Market context
    mv.median_price as current_market_value,
    mv.calculation_date as market_data_date,
    CASE 
        WHEN uc.acquisition_price IS NOT NULL AND mv.median_price IS NOT NULL
        THEN ((mv.median_price - uc.acquisition_price) / uc.acquisition_price) * 100
        ELSE NULL
    END as gain_loss_percentage
    
FROM user_collections uc
JOIN comic_series cs ON uc.series_id = cs.id
JOIN comic_issues ci ON uc.issue_id = ci.id
LEFT JOIN grading_standards gs ON uc.grade_id = gs.id
LEFT JOIN market_values mv ON (uc.series_id = mv.series_id AND uc.issue_id = mv.issue_id AND uc.grade_id = mv.grade_id);

-- View for trending comics (price movements)
CREATE OR REPLACE VIEW trending_comics AS
SELECT 
    cs.name as series_name,
    cs.publisher,
    ci.issue_number,
    ci.key_issue,
    gs.grade_label,
    mv.median_price,
    mv.price_trend_30d,
    mv.price_trend_90d,
    mv.sample_count,
    mv.calculation_date,
    
    -- Classify trend strength
    CASE 
        WHEN mv.price_trend_30d >= 20.0 THEN 'hot'
        WHEN mv.price_trend_30d >= 10.0 THEN 'trending_up'
        WHEN mv.price_trend_30d <= -10.0 THEN 'trending_down'
        ELSE 'stable'
    END as trend_category
    
FROM market_values mv
JOIN comic_series cs ON mv.series_id = cs.id
JOIN comic_issues ci ON mv.issue_id = ci.id
JOIN grading_standards gs ON mv.grade_id = gs.id
WHERE 
    mv.sample_count >= 10
    AND mv.calculation_date >= NOW() - INTERVAL '7 days'
    AND ABS(mv.price_trend_30d) >= 5.0
ORDER BY ABS(mv.price_trend_30d) DESC;

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    
    -- Collection stats
    COALESCE(collection_stats.total_items, 0) as total_collection_items,
    COALESCE(collection_stats.total_value, 0) as total_collection_value,
    COALESCE(collection_stats.wishlist_items, 0) as wishlist_items,
    COALESCE(collection_stats.key_issues, 0) as key_issues_owned,
    
    -- Alert stats
    COALESCE(alert_stats.active_alerts, 0) as active_alert_rules,
    COALESCE(alert_stats.alerts_triggered_30d, 0) as alerts_triggered_last_30_days,
    
    -- Activity stats
    u.last_login,
    u.created_at as member_since
    
FROM users u
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_items,
        SUM(COALESCE(current_value, acquisition_price, 0)) as total_value,
        COUNT(*) FILTER (WHERE is_wishlist_item = TRUE) as wishlist_items,
        COUNT(*) FILTER (WHERE ci.key_issue = TRUE) as key_issues
    FROM user_collections uc
    JOIN comic_issues ci ON uc.issue_id = ci.id
    WHERE is_wishlist_item = FALSE
    GROUP BY user_id
) collection_stats ON u.id = collection_stats.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) FILTER (WHERE is_active = TRUE) as active_alerts,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as alerts_triggered_30d
    FROM user_alert_rules
    GROUP BY user_id
) alert_stats ON u.id = alert_stats.user_id
WHERE u.is_active = TRUE;

-- =====================================================
-- INDEXES FOR VIEW PERFORMANCE
-- =====================================================

-- Additional indexes to support the views
CREATE INDEX IF NOT EXISTS idx_market_values_trend_30d ON market_values (ABS(price_trend_30d)) WHERE sample_count >= 10;
CREATE INDEX IF NOT EXISTS idx_user_collections_user_wishlist ON user_collections (user_id, is_wishlist_item);
CREATE INDEX IF NOT EXISTS idx_alert_rules_created_at ON user_alert_rules (created_at) WHERE created_at >= NOW() - INTERVAL '30 days';

-- =====================================================
-- SCHEDULED MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to be called daily for maintenance
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS TEXT AS $$
DECLARE
    expired_deals INTEGER;
    updated_values INTEGER := 0;
    result_text TEXT;
BEGIN
    -- Clean up expired deals
    SELECT cleanup_expired_deals() INTO expired_deals;
    
    -- Update market values for popular comics (could be expanded)
    -- This is a simplified version - in practice you'd want more sophisticated logic
    
    -- Log results
    result_text := format('Daily maintenance completed: %s expired deals cleaned up, %s market values updated', 
                         expired_deals, updated_values);
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users for safe functions
GRANT EXECUTE ON FUNCTION search_comic_series(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_collection_stats(UUID) TO authenticated;

-- Grant select permissions on views to authenticated users
GRANT SELECT ON active_deals_detailed TO authenticated;
GRANT SELECT ON user_collections_valued TO authenticated;  
GRANT SELECT ON trending_comics TO authenticated;
GRANT SELECT ON user_dashboard_stats TO authenticated;