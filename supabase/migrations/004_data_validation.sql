-- =====================================================
-- Phase 2: Database Migration - Data Validation
-- File: 004_data_validation.sql
-- Description: Comprehensive validation and integrity checks for migrated data
-- =====================================================

-- =====================================================
-- DATA INTEGRITY VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate referential integrity across all tables
CREATE OR REPLACE FUNCTION validate_referential_integrity()
RETURNS TABLE(
    table_name TEXT,
    constraint_name TEXT,
    validation_query TEXT,
    orphaned_records BIGINT,
    status TEXT
) AS $$
BEGIN
    -- Check for orphaned comic issues
    RETURN QUERY
    SELECT 
        'comic_issues'::TEXT,
        'series_id_fk'::TEXT,
        'Issues without valid series references'::TEXT,
        (SELECT COUNT(*) FROM comic_issues ci 
         LEFT JOIN comic_series cs ON ci.series_id = cs.id 
         WHERE cs.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM comic_issues ci LEFT JOIN comic_series cs ON ci.series_id = cs.id WHERE cs.id IS NULL) = 0 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned normalized listings
    RETURN QUERY
    SELECT 
        'normalized_listings'::TEXT,
        'series_issue_grade_fk'::TEXT,
        'Listings without valid series/issue/grade references'::TEXT,
        (SELECT COUNT(*) FROM normalized_listings nl
         LEFT JOIN comic_series cs ON nl.series_id = cs.id
         LEFT JOIN comic_issues ci ON nl.issue_id = ci.id
         LEFT JOIN grading_standards gs ON nl.grade_id = gs.id
         WHERE cs.id IS NULL OR ci.id IS NULL OR gs.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM normalized_listings nl
                  LEFT JOIN comic_series cs ON nl.series_id = cs.id
                  LEFT JOIN comic_issues ci ON nl.issue_id = ci.id
                  LEFT JOIN grading_standards gs ON nl.grade_id = gs.id
                  WHERE cs.id IS NULL OR ci.id IS NULL OR gs.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned market values
    RETURN QUERY
    SELECT 
        'market_values'::TEXT,
        'series_issue_grade_fk'::TEXT,
        'Market values without valid references'::TEXT,
        (SELECT COUNT(*) FROM market_values mv
         LEFT JOIN comic_series cs ON mv.series_id = cs.id
         LEFT JOIN comic_issues ci ON mv.issue_id = ci.id
         LEFT JOIN grading_standards gs ON mv.grade_id = gs.id
         WHERE cs.id IS NULL OR ci.id IS NULL OR gs.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM market_values mv
                  LEFT JOIN comic_series cs ON mv.series_id = cs.id
                  LEFT JOIN comic_issues ci ON mv.issue_id = ci.id
                  LEFT JOIN grading_standards gs ON mv.grade_id = gs.id
                  WHERE cs.id IS NULL OR ci.id IS NULL OR gs.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned user collections
    RETURN QUERY
    SELECT 
        'user_collections'::TEXT,
        'user_series_issue_fk'::TEXT,
        'Collections without valid user/series/issue references'::TEXT,
        (SELECT COUNT(*) FROM user_collections uc
         LEFT JOIN users u ON uc.user_id = u.id
         LEFT JOIN comic_series cs ON uc.series_id = cs.id
         LEFT JOIN comic_issues ci ON uc.issue_id = ci.id
         WHERE u.id IS NULL OR cs.id IS NULL OR ci.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM user_collections uc
                  LEFT JOIN users u ON uc.user_id = u.id
                  LEFT JOIN comic_series cs ON uc.series_id = cs.id
                  LEFT JOIN comic_issues ci ON uc.issue_id = ci.id
                  WHERE u.id IS NULL OR cs.id IS NULL OR ci.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned user alert rules
    RETURN QUERY
    SELECT 
        'user_alert_rules'::TEXT,
        'user_id_fk'::TEXT,
        'Alert rules without valid user references'::TEXT,
        (SELECT COUNT(*) FROM user_alert_rules uar
         LEFT JOIN users u ON uar.user_id = u.id
         WHERE u.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM user_alert_rules uar LEFT JOIN users u ON uar.user_id = u.id WHERE u.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned deals
    RETURN QUERY
    SELECT 
        'deals'::TEXT,
        'listing_market_value_fk'::TEXT,
        'Deals without valid listing/market value references'::TEXT,
        (SELECT COUNT(*) FROM deals d
         LEFT JOIN normalized_listings nl ON d.normalized_listing_id = nl.id
         LEFT JOIN market_values mv ON d.market_value_id = mv.id
         WHERE nl.id IS NULL OR mv.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM deals d
                  LEFT JOIN normalized_listings nl ON d.normalized_listing_id = nl.id
                  LEFT JOIN market_values mv ON d.market_value_id = mv.id
                  WHERE nl.id IS NULL OR mv.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned price history records
    RETURN QUERY
    SELECT 
        'price_history'::TEXT,
        'series_issue_grade_fk'::TEXT,
        'Price history without valid series/issue/grade references'::TEXT,
        (SELECT COUNT(*) FROM price_history ph
         LEFT JOIN comic_series cs ON ph.series_id = cs.id
         LEFT JOIN comic_issues ci ON ph.issue_id = ci.id
         LEFT JOIN grading_standards gs ON ph.grade_id = gs.id
         WHERE cs.id IS NULL OR ci.id IS NULL OR gs.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM price_history ph
                  LEFT JOIN comic_series cs ON ph.series_id = cs.id
                  LEFT JOIN comic_issues ci ON ph.issue_id = ci.id
                  LEFT JOIN grading_standards gs ON ph.grade_id = gs.id
                  WHERE cs.id IS NULL OR ci.id IS NULL OR gs.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
    
    -- Check for orphaned user preferences
    RETURN QUERY
    SELECT 
        'user_preferences'::TEXT,
        'user_id_fk'::TEXT,
        'User preferences without valid user references'::TEXT,
        (SELECT COUNT(*) FROM user_preferences up
         LEFT JOIN users u ON up.user_id = u.id
         WHERE u.id IS NULL)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM user_preferences up LEFT JOIN users u ON up.user_id = u.id WHERE u.id IS NULL) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATA CONSISTENCY VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate data consistency and business rules
CREATE OR REPLACE FUNCTION validate_data_consistency()
RETURNS TABLE(
    check_name TEXT,
    description TEXT,
    inconsistent_records BIGINT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check for negative prices
    RETURN QUERY
    SELECT 
        'Negative Prices'::TEXT,
        'Listings and price history should not have negative prices'::TEXT,
        (SELECT COUNT(*) FROM normalized_listings WHERE price < 0 OR total_cost < 0)::BIGINT +
        (SELECT COUNT(*) FROM price_history WHERE price < 0)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM normalized_listings WHERE price < 0 OR total_cost < 0) = 0 
                 AND (SELECT COUNT(*) FROM price_history WHERE price < 0) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check normalized_listings and price_history tables'::TEXT;
    
    -- Check for invalid date ranges in comic series
    RETURN QUERY
    SELECT 
        'Invalid Date Ranges'::TEXT,
        'Series end dates should not be before start dates'::TEXT,
        (SELECT COUNT(*) FROM comic_series 
         WHERE publication_end_date IS NOT NULL 
           AND publication_start_date IS NOT NULL 
           AND publication_end_date < publication_start_date)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM comic_series 
                  WHERE publication_end_date IS NOT NULL 
                    AND publication_start_date IS NOT NULL 
                    AND publication_end_date < publication_start_date) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check comic_series publication date ranges'::TEXT;
    
    -- Check for invalid deal scores
    RETURN QUERY
    SELECT 
        'Invalid Deal Scores'::TEXT,
        'Deal scores should be between 0 and 100'::TEXT,
        (SELECT COUNT(*) FROM deals WHERE deal_score < 0 OR deal_score > 100)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM deals WHERE deal_score < 0 OR deal_score > 100) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check deals table for invalid scores'::TEXT;
    
    -- Check for invalid grading values
    RETURN QUERY
    SELECT 
        'Invalid Grade Values'::TEXT,
        'Grade values should be between 0.5 and 10.0'::TEXT,
        (SELECT COUNT(*) FROM grading_standards WHERE grade_value < 0.5 OR grade_value > 10.0)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM grading_standards WHERE grade_value < 0.5 OR grade_value > 10.0) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check grading_standards table'::TEXT;
    
    -- Check for duplicate series-issue-variant combinations
    RETURN QUERY
    SELECT 
        'Duplicate Issue Variants'::TEXT,
        'No duplicate series-issue-variant combinations should exist'::TEXT,
        (SELECT COUNT(*) - COUNT(DISTINCT series_id, issue_number, COALESCE(variant, 'none')) 
         FROM comic_issues)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM comic_issues) = 
                 (SELECT COUNT(DISTINCT series_id, issue_number, COALESCE(variant, 'none')) FROM comic_issues)
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check comic_issues for duplicates'::TEXT;
    
    -- Check for future sale dates in price history
    RETURN QUERY
    SELECT 
        'Future Sale Dates'::TEXT,
        'Price history should not contain future sale dates'::TEXT,
        (SELECT COUNT(*) FROM price_history WHERE sale_date > CURRENT_DATE)::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM price_history WHERE sale_date > CURRENT_DATE) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check price_history table for future dates'::TEXT;
    
    -- Check for market values without sample data
    RETURN QUERY
    SELECT 
        'Empty Market Values'::TEXT,
        'Market values should have sample count > 0 when price data exists'::TEXT,
        (SELECT COUNT(*) FROM market_values 
         WHERE (median_price IS NOT NULL OR mean_price IS NOT NULL) 
           AND (sample_count IS NULL OR sample_count = 0))::BIGINT,
        CASE 
            WHEN (SELECT COUNT(*) FROM market_values 
                  WHERE (median_price IS NOT NULL OR mean_price IS NOT NULL) 
                    AND (sample_count IS NULL OR sample_count = 0)) = 0
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Check market_values for inconsistent sample counts'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate database performance and index usage
CREATE OR REPLACE FUNCTION validate_performance_metrics()
RETURNS TABLE(
    metric_name TEXT,
    table_name TEXT,
    metric_value BIGINT,
    threshold BIGINT,
    status TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Check table sizes
    RETURN QUERY
    SELECT 
        'Table Size'::TEXT,
        'normalized_listings'::TEXT,
        (SELECT COUNT(*) FROM normalized_listings)::BIGINT,
        1000000::BIGINT, -- 1M threshold
        CASE 
            WHEN (SELECT COUNT(*) FROM normalized_listings) < 1000000 
            THEN 'PASS'::TEXT 
            ELSE 'WARNING'::TEXT 
        END,
        'Consider partitioning if table grows beyond 1M records'::TEXT;
    
    -- Check for missing indexes on frequently queried columns
    RETURN QUERY
    SELECT 
        'Index Coverage'::TEXT,
        'price_history'::TEXT,
        (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'price_history')::BIGINT,
        3::BIGINT, -- Expected minimum indexes
        CASE 
            WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'price_history') >= 3 
            THEN 'PASS'::TEXT 
            ELSE 'FAIL'::TEXT 
        END,
        'Ensure proper indexing on price_history table'::TEXT;
    
    -- Check for large table scan potential
    RETURN QUERY
    SELECT 
        'Sequential Scan Risk'::TEXT,
        'market_values'::TEXT,
        (SELECT COUNT(*) FROM market_values WHERE calculation_date < NOW() - INTERVAL '30 days')::BIGINT,
        (SELECT COUNT(*) FROM market_values)::BIGINT / 4, -- 25% threshold
        CASE 
            WHEN (SELECT COUNT(*) FROM market_values WHERE calculation_date < NOW() - INTERVAL '30 days') < 
                 (SELECT COUNT(*) FROM market_values) / 4
            THEN 'PASS'::TEXT 
            ELSE 'WARNING'::TEXT 
        END,
        'Consider archiving old market value data'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPREHENSIVE VALIDATION SUITE
-- =====================================================

-- Master validation function that runs all checks
CREATE OR REPLACE FUNCTION run_comprehensive_validation()
RETURNS TABLE(
    validation_category TEXT,
    check_details JSONB,
    overall_status TEXT,
    execution_time INTERVAL
) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    integrity_results JSONB;
    consistency_results JSONB;
    performance_results JSONB;
BEGIN
    -- Run referential integrity checks
    start_time := NOW();
    
    SELECT json_agg(row_to_json(t)) INTO integrity_results
    FROM (SELECT * FROM validate_referential_integrity()) t;
    
    end_time := NOW();
    
    RETURN QUERY
    SELECT 
        'Referential Integrity'::TEXT,
        integrity_results,
        CASE 
            WHEN integrity_results::text LIKE '%FAIL%' 
            THEN 'FAIL'::TEXT 
            ELSE 'PASS'::TEXT 
        END,
        (end_time - start_time);
    
    -- Run data consistency checks
    start_time := NOW();
    
    SELECT json_agg(row_to_json(t)) INTO consistency_results
    FROM (SELECT * FROM validate_data_consistency()) t;
    
    end_time := NOW();
    
    RETURN QUERY
    SELECT 
        'Data Consistency'::TEXT,
        consistency_results,
        CASE 
            WHEN consistency_results::text LIKE '%FAIL%' 
            THEN 'FAIL'::TEXT 
            ELSE 'PASS'::TEXT 
        END,
        (end_time - start_time);
    
    -- Run performance validation
    start_time := NOW();
    
    SELECT json_agg(row_to_json(t)) INTO performance_results
    FROM (SELECT * FROM validate_performance_metrics()) t;
    
    end_time := NOW();
    
    RETURN QUERY
    SELECT 
        'Performance Metrics'::TEXT,
        performance_results,
        CASE 
            WHEN performance_results::text LIKE '%FAIL%' 
            THEN 'FAIL'::TEXT
            WHEN performance_results::text LIKE '%WARNING%' 
            THEN 'WARNING'::TEXT
            ELSE 'PASS'::TEXT 
        END,
        (end_time - start_time);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATA REPAIR FUNCTIONS
-- =====================================================

-- Function to fix common data issues
CREATE OR REPLACE FUNCTION repair_data_issues()
RETURNS TABLE(
    repair_action TEXT,
    records_affected BIGINT,
    status TEXT
) AS $$
DECLARE
    affected_count BIGINT;
BEGIN
    -- Fix negative shipping costs
    UPDATE normalized_listings SET shipping_cost = 0 WHERE shipping_cost < 0;
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    RETURN QUERY
    SELECT 
        'Fix Negative Shipping Costs'::TEXT,
        affected_count,
        'COMPLETED'::TEXT;
    
    -- Fix invalid deal scores
    UPDATE deals SET deal_score = GREATEST(0, LEAST(100, deal_score)) WHERE deal_score < 0 OR deal_score > 100;
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    RETURN QUERY
    SELECT 
        'Fix Invalid Deal Scores'::TEXT,
        affected_count,
        'COMPLETED'::TEXT;
    
    -- Update market values calculation dates that are in the future
    UPDATE market_values SET calculation_date = NOW() WHERE calculation_date > NOW();
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    RETURN QUERY
    SELECT 
        'Fix Future Calculation Dates'::TEXT,
        affected_count,
        'COMPLETED'::TEXT;
    
    -- Clean up empty string values in text fields
    UPDATE comic_series SET description = NULL WHERE description = '';
    UPDATE comic_issues SET synopsis = NULL WHERE synopsis = '';
    UPDATE comic_issues SET key_issue_notes = NULL WHERE key_issue_notes = '';
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    RETURN QUERY
    SELECT 
        'Clean Empty String Values'::TEXT,
        affected_count,
        'COMPLETED'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VALIDATION SUMMARY FUNCTIONS
-- =====================================================

-- Function to generate a validation summary report
CREATE OR REPLACE FUNCTION generate_validation_summary()
RETURNS TABLE(
    summary_section TEXT,
    total_checks INTEGER,
    passed_checks INTEGER,
    failed_checks INTEGER,
    warning_checks INTEGER,
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    -- Overall summary
    RETURN QUERY
    WITH validation_stats AS (
        SELECT 
            CASE 
                WHEN overall_status = 'PASS' THEN 1 
                ELSE 0 
            END as passed,
            CASE 
                WHEN overall_status = 'FAIL' THEN 1 
                ELSE 0 
            END as failed,
            CASE 
                WHEN overall_status = 'WARNING' THEN 1 
                ELSE 0 
            END as warnings
        FROM run_comprehensive_validation()
    )
    SELECT 
        'Overall Migration Validation'::TEXT,
        COUNT(*)::INTEGER as total,
        SUM(passed)::INTEGER as passed,
        SUM(failed)::INTEGER as failed,
        SUM(warnings)::INTEGER as warnings,
        (SUM(passed)::DECIMAL / COUNT(*) * 100)::DECIMAL(5,2) as success_rate
    FROM validation_stats;
END;
$$ LANGUAGE plpgsql;

-- Log completion
INSERT INTO migration_log (migration_file, status, completed_at, migration_data) 
VALUES ('004_data_validation.sql', 'completed', NOW(), 
        jsonb_build_object(
            'validation_functions_created', 8,
            'repair_functions_created', 1,
            'comprehensive_checks', true
        ));