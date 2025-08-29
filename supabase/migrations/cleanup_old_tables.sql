-- ============================================================================
-- ComicScoutUK Database Migration - Phase 2
-- Script: 005_cleanup_old_tables.sql
-- Purpose: Clean up backup tables and finalize migration
-- Created: August 29, 2025
-- Author: Lead Refactoring Architect
-- 
-- WARNING: This script will permanently delete backup tables and old data
-- Only run this script after successful validation and application testing
-- ============================================================================

-- ============================================================================
-- SAFETY CHECKS AND PREREQUISITES
-- ============================================================================

-- Create a final safety check before cleanup
DO $$
DECLARE
    validation_passed BOOLEAN := FALSE;
    critical_failures INTEGER := 0;
    backup_tables_count INTEGER := 0;
    days_since_migration INTEGER;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'MIGRATION CLEANUP - SAFETY CHECKS';
    RAISE NOTICE 'Started at: %', NOW();
    RAISE NOTICE '============================================================================';
    
    -- Check if validation was completed successfully
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'validation_history') THEN
        SELECT COUNT(*) INTO critical_failures
        FROM validation_history
        WHERE validation_type = 'Phase 2 - Post Migration Validation'
        AND severity = 'CRITICAL'
        AND status = 'FAIL';
        
        validation_passed := (critical_failures = 0);
        RAISE NOTICE 'Validation history found - Critical failures: %', critical_failures;
    ELSE
        RAISE NOTICE 'WARNING: No validation history found!';
        RAISE NOTICE 'It is strongly recommended to run 004_data_validation.sql first.';
    END IF;
    
    -- Count backup tables
    SELECT COUNT(*) INTO backup_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%_backup_%';
    
    RAISE NOTICE 'Backup tables found: %', backup_tables_count;
    
    -- Check time since migration
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_history') THEN
        SELECT EXTRACT(DAYS FROM (NOW() - MAX(migration_date)))::INTEGER 
        INTO days_since_migration
        FROM migration_history
        WHERE migration_type = 'Phase 2 - Data Migration';
        
        RAISE NOTICE 'Days since migration: %', COALESCE(days_since_migration, 0);
    END IF;
    
    -- Safety warnings
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'IMPORTANT SAFETY WARNINGS:';
    RAISE NOTICE '============================================================================';
    
    IF NOT validation_passed THEN
        RAISE NOTICE '⚠️  CRITICAL: Validation failures detected!';
        RAISE NOTICE '   This script should not be run until all critical issues are resolved.';
    END IF;
    
    IF backup_tables_count = 0 THEN
        RAISE NOTICE '⚠️  WARNING: No backup tables found to clean up.';
    END IF;
    
    IF COALESCE(days_since_migration, 999) < 1 THEN
        RAISE NOTICE '⚠️  CAUTION: Migration was very recent (< 1 day ago).';
        RAISE NOTICE '   Consider waiting and testing more thoroughly before cleanup.';
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'This script will PERMANENTLY DELETE backup tables and old data.';
    RAISE NOTICE 'Make sure you have:';
    RAISE NOTICE '1. ✓ Validated the migration successfully';
    RAISE NOTICE '2. ✓ Tested the application thoroughly';
    RAISE NOTICE '3. ✓ Created external database backups if needed';
    RAISE NOTICE '4. ✓ Confirmed all data is accessible and correct';
    RAISE NOTICE '============================================================================';
    
    -- Stop execution if critical issues found
    IF critical_failures > 0 THEN
        RAISE EXCEPTION 'CLEANUP ABORTED: Critical validation failures must be resolved first. Check validation_issues view for details.';
    END IF;
END $$;

-- Additional manual confirmation step
-- Uncomment the following line only when you're absolutely certain cleanup should proceed:
-- SELECT 'MANUAL_CONFIRMATION_TO_PROCEED' as confirmation_required;

-- Comment out the following EXCEPTION to actually run the cleanup
DO $$
BEGIN
    RAISE EXCEPTION 'SAFETY STOP: To run cleanup, you must:
1. Review the safety checks above
2. Uncomment the manual confirmation line
3. Comment out this exception block
4. Re-run this script

This prevents accidental execution of destructive operations.';
END $$;

-- ============================================================================
-- CLEANUP TRACKING AND LOGGING
-- ============================================================================

-- Create cleanup tracking table
CREATE TEMP TABLE cleanup_log (
    cleanup_id SERIAL PRIMARY KEY,
    cleanup_step VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    action_type VARCHAR(50), -- 'DROP', 'ARCHIVE', 'RENAME'
    records_affected INTEGER,
    table_size TEXT,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT
);

-- Helper
