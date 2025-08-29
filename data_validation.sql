-- ============================================================================
-- ComicScoutUK Database Migration - Phase 2
-- Script: 004_data_validation.sql
-- Purpose: Comprehensive validation of migrated data and schema integrity
-- Created: August 29, 2025
-- Author: Lead Refactoring Architect
-- ============================================================================

-- ============================================================================
-- VALIDATION SETUP
-- ============================================================================

-- Create temporary table to track validation results
CREATE TEMP TABLE validation_results (
    validation_id SERIAL PRIMARY KEY,
    test_category VARCHAR(50) NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    test_description TEXT,
    expected_result TEXT,
    actual_result TEXT,
    status VARCHAR(20) CHECK (status IN ('PASS', 'FAIL', 'WARNING', 'INFO')),
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    error_details TEXT,
    execution_time TIMESTAMP DEFAULT NOW()
);

-- Helper function to log validation results
CREATE OR REPLACE FUNCTION log_validation(
    category VARCHAR(50),
    test_name VARCHAR(100),
    description TEXT,
    expected_val TEXT,
    actual_val TEXT,
    test_status VARCHAR(20),
    test_severity VARCHAR(20) DEFAULT 'MEDIUM',
    details TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO validation_results (
        test_category, test_name, test_description, 
        expected_result, actual_result, status, severity, error_details
    ) VALUES (
        category, test_name, description,
        expected_val, actual_val, test_status, test_severity, details
    );
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '============================================================================';
RAISE NOTICE 'STARTING DATA VALIDATION - Phase 2';
RAISE NOTICE 'Validation started at: %', NOW();
RAISE NOTICE '============================================================================';

-- ============================================================================
-- 1. SCHEMA STRUCTURE VALIDATION
-- ============================================================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'users', 'comics', 'user_collection', 'wishlist_items', 'alert_settings',
        'trophies', 'user_trophies', 'user_follows', 'comic_comments',
        'ebay_listings', 'alert_history', 'series', 'collection_goals',
        'local_comic_shops', 'market_data'
    ];
    table_name TEXT;
    table_exists BOOLEAN;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_count INTEGER;
BEGIN
    RAISE NOTICE 'Validating schema structure...';
    
    -- Check if all required tables exist
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = log_validation.table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            PERFORM log_validation(
                'SCHEMA', 
                'TABLE_EXISTS_' || UPPER(table_name),
                'Table ' || table_name || ' exists',
                'TRUE',
                'TRUE',
                'PASS'
            );
        ELSE
            missing_tables := missing_tables || table_name;
            PERFORM log_validation(
                'SCHEMA', 
                'TABLE_EXISTS_' || UPPER(table_name),
                'Table ' || table_name || ' exists',
                'TRUE',
                'FALSE',
                'FAIL',
                'CRITICAL'
            );
        END IF;
    END LOOP;
    
    -- Overall schema validation
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY(expected_tables);
    
    PERFORM log_validation(
        'SCHEMA',
        'REQUIRED_TABLES_COUNT',
        'All required tables present',
        array_length(expected_tables, 1)::TEXT,
        table_count::TEXT,
        CASE WHEN table_count = array_length(expected_tables, 1) THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN table_count = array_length(expected_tables, 1) THEN 'LOW' ELSE 'CRITICAL' END
    );
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- ============================================================================
-- 2. DATA INTEGRITY VALIDATION
-- ============================================================================

DO $$
DECLARE
    user_count INTEGER;
    comic_count INTEGER;
    collection_count INTEGER;
    orphaned_collections INTEGER;
    invalid_references INTEGER;
BEGIN
    RAISE NOTICE 'Validating data integrity...';
    
    -- Check basic record counts
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO comic_count FROM comics;
    SELECT COUNT(*) INTO collection_count FROM user_collection;
    
    PERFORM log_validation(
        'DATA_INTEGRITY',
        'USER_COUNT',
        'Users table has records',
        '> 0',
        user_count::TEXT,
        CASE WHEN user_count > 0 THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
    
    PERFORM log_validation(
        'DATA_INTEGRITY',
        'COMIC_COUNT',
        'Comics table has records',
        '> 0',
        comic_count::TEXT,
        CASE WHEN comic_count > 0 THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
    
    -- Check for orphaned collection records
    SELECT COUNT(*) INTO orphaned_collections
    FROM user_collection uc
    LEFT JOIN users u ON uc.user_id = u.user_id
    LEFT JOIN comics c ON uc.comic_id = c.comic_id
    WHERE u.user_id IS NULL OR c.comic_id IS NULL;
    
    PERFORM log_validation(
        'DATA_INTEGRITY',
        'ORPHANED_COLLECTIONS',
        'No orphaned collection records',
        '0',
        orphaned_collections::TEXT,
        CASE WHEN orphaned_collections = 0 THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN orphaned_collections = 0 THEN 'LOW' ELSE 'HIGH' END,
        CASE WHEN orphaned_collections > 0 THEN 'Found ' || orphaned_collections || ' orphaned collection records' ELSE NULL END
    );
    
    -- Check wishlist referential integrity
    SELECT COUNT(*) INTO invalid_references
    FROM wishlist_items wi
    LEFT JOIN users u ON wi.user_id = u.user_id
    LEFT JOIN comics c ON wi.comic_id = c.comic_id
    WHERE u.user_id IS NULL OR c.comic_id IS NULL;
    
    PERFORM log_validation(
        'DATA_INTEGRITY',
        'WISHLIST_INTEGRITY',
        'Wishlist items have valid references',
        '0',
        invalid_references::TEXT,
        CASE WHEN invalid_references = 0 THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN invalid_references = 0 THEN 'LOW' ELSE 'HIGH' END
    );
    
    -- Check for duplicate collection entries
    SELECT COUNT(*) INTO invalid_references
    FROM (
        SELECT user_id, comic_id, COUNT(*) 
        FROM user_collection 
        GROUP BY user_id, comic_id 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    PERFORM log_validation(
        'DATA_INTEGRITY',
        'DUPLICATE_COLLECTIONS',
        'No duplicate collection entries',
        '0',
        invalid_references::TEXT,
        CASE WHEN invalid_references = 0 THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN invalid_references = 0 THEN 'LOW' ELSE 'MEDIUM' END
    );
END $$;

-- ============================================================================
-- 3. CONSTRAINT VALIDATION
-- ============================================================================

DO $$
DECLARE
    constraint_violations INTEGER;
    invalid_emails INTEGER;
    invalid_grades INTEGER;
    invalid_prices INTEGER;
BEGIN
    RAISE NOTICE 'Validating constraints and data quality...';
    
    -- Check email format validation
    SELECT COUNT(*) INTO invalid_emails
    FROM users
    WHERE email IS NOT NULL 
    AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    
    PERFORM log_validation(
        'CONSTRAINTS',
        'EMAIL_FORMAT',
        'All user emails are properly formatted',
        '0',
        invalid_emails::TEXT,
        CASE WHEN invalid_emails = 0 THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN invalid_emails = 0 THEN 'LOW' ELSE 'MEDIUM' END
    );
    
    -- Check grade values
    SELECT COUNT(*) INTO invalid_grades
    FROM user_collection
    WHERE grade IS NOT NULL 
    AND grade NOT IN ('NM', 'VF', 'FN', 'VG', 'GD', 'FR', 'PR')
    AND grade !~ '^[0-9]+\.?[0-9]*$';
    
    PERFORM log_validation(
        'CONSTRAINTS',
        'GRADE_VALUES',
        'Collection grades are in valid format',
        '0',
        invalid_grades::TEXT,
        CASE WHEN invalid_grades = 0 THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
    
    -- Check price values
    SELECT COUNT(*) INTO invalid_prices
    FROM user_collection
    WHERE (purchase_price IS NOT NULL AND purchase_price < 0)
    OR (current_value IS NOT NULL AND current_value < 0)
    OR (asking_price IS NOT NULL AND asking_price <= 0);
    
    PERFORM log_validation(
        'CONSTRAINTS',
        'PRICE_VALUES',
        'All price values are positive',
        '0',
        invalid_prices::TEXT,
        CASE WHEN invalid_prices = 0 THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN invalid_prices = 0 THEN 'LOW' ELSE 'MEDIUM' END
    );
    
    -- Check subscription tiers
    SELECT COUNT(*) INTO constraint_violations
    FROM users
    WHERE subscription_tier NOT IN ('free', 'medium', 'pro');
    
    PERFORM log_validation(
        'CONSTRAINTS',
        'SUBSCRIPTION_TIERS',
        'All subscription tiers are valid',
        '0',
        constraint_violations::TEXT,
        CASE WHEN constraint_violations = 0 THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN constraint_violations = 0 THEN 'LOW' ELSE 'HIGH' END
    );
END $$;

-- ============================================================================
-- 4. INDEX AND PERFORMANCE VALIDATION
-- ============================================================================

DO $$
DECLARE
    critical_indexes TEXT[] := ARRAY[
        'users_email_key',
        'idx_user_collection_user_id',
        'idx_comics_title_issue',
        'idx_wishlist_active'
    ];
    index_name TEXT;
    index_exists BOOLEAN;
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
    total_indexes INTEGER;
BEGIN
    RAISE NOTICE 'Validating indexes and performance optimizations...';
    
    -- Check for critical indexes
    FOREACH index_name IN ARRAY critical_indexes
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' AND indexname = log_validation.index_name
        ) INTO index_exists;
        
        IF index_exists THEN
            PERFORM log_validation(
                'PERFORMANCE',
                'INDEX_EXISTS_' || UPPER(index_name),
                'Critical index exists: ' || index_name,
                'TRUE',
                'TRUE',
                'PASS'
            );
        ELSE
            missing_indexes := missing_indexes || index_name;
            PERFORM log_validation(
                'PERFORMANCE',
                'INDEX_EXISTS_' || UPPER(index_name),
                'Critical index exists: ' || index_name,
                'TRUE',
                'FALSE',
                'FAIL',
                'HIGH'
            );
        END IF;
    END LOOP;
    
    -- Count total indexes created
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    PERFORM log_validation(
        'PERFORMANCE',
        'TOTAL_INDEXES',
        'Adequate number of indexes created',
        '> 20',
        total_indexes::TEXT,
        CASE WHEN total_indexes > 20 THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
END $$;

-- ============================================================================
-- 5. FUNCTIONAL VALIDATION
-- ============================================================================

DO $$
DECLARE
    search_function_works BOOLEAN;
    trigger_count INTEGER;
    computed_fields_working BOOLEAN;
    sample_profit_loss DECIMAL(10,2);
BEGIN
    RAISE NOTICE 'Validating functional features...';
    
    -- Test search functionality
    BEGIN
        PERFORM to_tsvector('english', 'Amazing Spider-Man Marvel Comics');
        search_function_works := TRUE;
    EXCEPTION WHEN OTHERS THEN
        search_function_works := FALSE;
    END;
    
    PERFORM log_validation(
        'FUNCTIONALITY',
        'SEARCH_FUNCTION',
        'Full-text search functionality works',
        'TRUE',
        search_function_works::TEXT,
        CASE WHEN search_function_works THEN 'PASS' ELSE 'FAIL' END,
        CASE WHEN search_function_works THEN 'LOW' ELSE 'MEDIUM' END
    );
    
    -- Check triggers are in place
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    PERFORM log_validation(
        'FUNCTIONALITY',
        'TRIGGERS_CREATED',
        'Database triggers are in place',
        '> 0',
        trigger_count::TEXT,
        CASE WHEN trigger_count > 0 THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
    
    -- Test computed fields (profit_loss)
    SELECT profit_loss INTO sample_profit_loss
    FROM user_collection
    WHERE purchase_price IS NOT NULL AND current_value IS NOT NULL
    LIMIT 1;
    
    computed_fields_working := (sample_profit_loss IS NOT NULL);
    
    PERFORM log_validation(
        'FUNCTIONALITY',
        'COMPUTED_FIELDS',
        'Computed fields (profit/loss) working',
        'TRUE',
        computed_fields_working::TEXT,
        CASE WHEN computed_fields_working THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
END $$;

-- ============================================================================
-- 6. BUSINESS LOGIC VALIDATION
-- ============================================================================

DO $$
DECLARE
    users_with_collections INTEGER;
    users_with_stats INTEGER;
    trophy_system_working BOOLEAN;
    alert_system_ready BOOLEAN;
BEGIN
    RAISE NOTICE 'Validating business logic and features...';
    
    -- Check user statistics are calculated
    SELECT COUNT(*) INTO users_with_collections
    FROM users u
    INNER JOIN user_collection uc ON u.user_id = uc.user_id;
    
    SELECT COUNT(*) INTO users_with_stats
    FROM users
    WHERE total_comics_owned > 0;
    
    PERFORM log_validation(
        'BUSINESS_LOGIC',
        'USER_STATISTICS',
        'User statistics are calculated correctly',
        users_with_collections::TEXT,
        users_with_stats::TEXT,
        CASE WHEN users_with_stats >= users_with_collections THEN 'PASS' ELSE 'WARNING' END,
        'MEDIUM'
    );
    
    -- Check trophy system
    trophy_system_working := EXISTS (
        SELECT 1 FROM trophies 
        WHERE name = 'First Comic'
    ) AND EXISTS (
        SELECT 1 FROM user_trophies ut
        INNER JOIN users u ON ut.user_id = u.user_id
        WHERE u.total_comics_owned >= 1
    );
    
    PERFORM log_validation(
        'BUSINESS_LOGIC',
        'TROPHY_SYSTEM',
        'Trophy system is functioning',
        'TRUE',
        trophy_system_working::TEXT,
        CASE WHEN trophy_system_working THEN 'PASS' ELSE 'WARNING' END,
        'LOW'
    );
    
    -- Check alert system readiness
    alert_system_ready := EXISTS (
        SELECT 1 FROM alert_settings
    ) AND EXISTS (
        SELECT 1 FROM wishlist_items
    );
    
    PERFORM log_validation(
        'BUSINESS_LOGIC',
        'ALERT_SYSTEM',
        'Alert system is ready for use',
        'TRUE',
        alert_system_ready::TEXT,
        CASE WHEN alert_system_ready THEN 'PASS' ELSE 'INFO' END,
        'LOW'
    );
END $$;

-- ============================================================================
-- 7. SECURITY VALIDATION
-- ============================================================================

DO $$
DECLARE
    rls_enabled_count INTEGER;
    expected_rls_tables INTEGER := 6; -- users, user_collection, wishlist_items, alert_settings, user_trophies, alert_history
    policies_count INTEGER;
BEGIN
    RAISE NOTICE 'Validating security features...';
    
    -- Check Row Level Security is enabled
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relname IN ('users', 'user_collection', 'wishlist_items', 'alert_settings', 'user_trophies', 'alert_history')
    AND c.relrowsecurity = true;
    
    PERFORM log_validation(
        'SECURITY',
        'RLS_ENABLED',
        'Row Level Security enabled on user tables',
        expected_rls_tables::TEXT,
        rls_enabled_count::TEXT,
        CASE WHEN rls_enabled_count = expected_rls_tables THEN 'PASS' ELSE 'WARNING' END,
        'HIGH'
    );
    
    -- Check security policies exist
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    PERFORM log_validation(
        'SECURITY',
        'SECURITY_POLICIES',
        'Security policies are in place',
        '> 0',
        policies_count::TEXT,
        CASE WHEN policies_count > 0 THEN 'PASS' ELSE 'WARNING' END,
        'HIGH'
    );
END $$;

-- ============================================================================
-- 8. BACKUP VALIDATION
-- ============================================================================

DO $$
DECLARE
    backup_tables_count INTEGER;
    backup_metadata_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'Validating backup integrity...';
    
    -- Check backup tables still exist
    SELECT COUNT(*) INTO backup_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%_backup_%';
    
    PERFORM log_validation(
        'BACKUP',
        'BACKUP_TABLES_EXIST',
        'Backup tables are preserved',
        '> 0',
        backup_tables_count::TEXT,
        CASE WHEN backup_tables_count > 0 THEN 'PASS' ELSE 'WARNING' END,
        'HIGH',
        CASE WHEN backup_tables_count = 0 THEN 'No backup tables found - data recovery may not be possible' ELSE NULL END
    );
    
    -- Check backup metadata
    backup_metadata_exists := EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name LIKE 'migration_backup_metadata_%'
    );
    
    PERFORM log_validation(
        'BACKUP',
        'BACKUP_METADATA',
        'Backup metadata is available',
        'TRUE',
        backup_metadata_exists::TEXT,
        CASE WHEN backup_metadata_exists THEN 'PASS' ELSE 'WARNING' END,
        'MEDIUM'
    );
END $$;

-- ============================================================================
-- VALIDATION SUMMARY AND REPORTING
-- ============================================================================

-- Create detailed validation report
CREATE TEMP VIEW validation_summary AS
SELECT 
    test_category,
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE status = 'PASS') as passed,
    COUNT(*) FILTER (WHERE status = 'FAIL') as failed,
    COUNT(*) FILTER (WHERE status = 'WARNING') as warnings,
    COUNT(*) FILTER (WHERE status = 'INFO') as info,
    COUNT(*) FILTER (WHERE severity = 'CRITICAL' AND status = 'FAIL') as critical_failures
FROM validation_results
GROUP BY test_category
ORDER BY test_category;

-- Generate final validation report
DO $$
DECLARE
    rec RECORD;
    total_tests INTEGER := 0;
    total_passed INTEGER := 0;
    total_failed INTEGER := 0;
    total_warnings INTEGER := 0;
    critical_failures INTEGER := 0;
    validation_success BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATA VALIDATION COMPLETION REPORT';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Category          | Total | Pass | Fail | Warn | Critical';
    RAISE NOTICE '------------------|-------|------|------|------|----------';
    
    FOR rec IN SELECT * FROM validation_summary LOOP
        RAISE NOTICE '%-17s | %5s | %4s | %4s | %4s | %8s',
            rec.test_category,
            rec.total_tests,
            rec.passed,
            rec.failed,
            rec.warnings,
            rec.critical_failures;
            
        total_tests := total_tests + rec.total_tests;
        total_passed := total_passed + rec.passed;
        total_failed := total_failed + rec.failed;
        total_warnings := total_warnings + rec.warnings;
        critical_failures := critical_failures + rec.critical_failures;
        
        IF rec.critical_failures > 0 THEN
            validation_success := FALSE;
        END IF;
    END LOOP;
    
    RAISE NOTICE '------------------|-------|------|------|------|----------';
    RAISE NOTICE 'TOTALS            | %5s | %4s | %4s | %4s | %8s',
        total_tests, total_passed, total_failed, total_warnings, critical_failures;
    
    RAISE NOTICE '============================================================================';
    
    -- Overall validation result
    IF validation_success AND critical_failures = 0 THEN
        RAISE NOTICE 'VALIDATION RESULT: SUCCESS ✓';
        RAISE NOTICE '';
        RAISE NOTICE 'Migration validation completed successfully!';
        RAISE NOTICE 'Database is ready for application testing.';
        RAISE NOTICE '';
        RAISE NOTICE 'Final Database Statistics:';
        RAISE NOTICE '- Users: % records', (SELECT COUNT(*) FROM users);
        RAISE NOTICE '- Comics: % records', (SELECT COUNT(*) FROM comics);
        RAISE NOTICE '- Collections: % records', (SELECT COUNT(*) FROM user_collection);
        RAISE NOTICE '- Wishlist Items: % records', (SELECT COUNT(*) FROM wishlist_items);
        RAISE NOTICE '- Trophies Earned: % records', (SELECT COUNT(*) FROM user_trophies);
        RAISE NOTICE '- Alert Settings: % records', (SELECT COUNT(*) FROM alert_settings);
    ELSE
        RAISE NOTICE 'VALIDATION RESULT: FAILED ✗';
        RAISE NOTICE '';
        RAISE NOTICE 'Critical issues found that must be resolved:';
        
        FOR rec IN 
            SELECT test_name, test_description, error_details 
            FROM validation_results 
            WHERE severity = 'CRITICAL' AND status = 'FAIL'
        LOOP
            RAISE NOTICE '- %: %', rec.test_name, COALESCE(rec.error_details, rec.test_description);
        END LOOP;
        
        RAISE NOTICE '';
        RAISE NOTICE 'DO NOT PROCEED with cleanup until issues are resolved!';
    END IF;
    
    IF total_warnings > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Warnings to review:';
        FOR rec IN 
            SELECT test_name, test_description 
            FROM validation_results 
            WHERE status = 'WARNING'
        LOOP
            RAISE NOTICE '- %: %', rec.test_name, rec.test_description;
        END LOOP;
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next Steps:';
    IF validation_success THEN
        RAISE NOTICE '1. Test application functionality with new schema';
        RAISE NOTICE '2. Run performance tests if needed';
        RAISE NOTICE '3. If everything works, run cleanup: 005_cleanup_old_tables.sql';
        RAISE NOTICE '4. Monitor application for any issues';
    ELSE
        RAISE NOTICE '1. Review and fix critical issues listed above';
        RAISE NOTICE '2. Re-run this validation script';
        RAISE NOTICE '3. Consider rollback if issues cannot be resolved';
    END IF;
    RAISE NOTICE '============================================================================';
END $$;

-- Store validation results for future reference
CREATE TABLE IF NOT EXISTS validation_history AS
SELECT 
    NOW() as validation_date,
    'Phase 2 - Post Migration Validation' as validation_type,
    *
FROM validation_results;

-- Create a permanent view for failed validations (if any)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM validation_results WHERE status IN ('FAIL', 'WARNING')) THEN
        CREATE OR REPLACE VIEW validation_issues AS
        SELECT 
            test_category,
            test_name,
            test_description,
            status,
            severity,
            actual_result,
            expected_result,
            error_details
        FROM validation_results
        WHERE status IN ('FAIL', 'WARNING')
        ORDER BY 
            CASE severity 
                WHEN 'CRITICAL' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'MEDIUM' THEN 3 
                ELSE 4 
            END,
            test_category,
            test_name;
            
        RAISE NOTICE 'Created view "validation_issues" to review problems';
        RAISE NOTICE 'Query: SELECT * FROM validation_issues;';
    END IF;
END $$;

-- Final log
RAISE NOTICE 'Validation script 004_data_validation.sql completed at %', NOW();

-- End of script