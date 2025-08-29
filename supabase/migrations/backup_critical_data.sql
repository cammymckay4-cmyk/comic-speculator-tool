-- ============================================================================
-- ComicScoutUK Database Migration - Phase 2
-- Script: 001_backup_critical_data.sql
-- Purpose: Create backup tables for critical data before schema migration
-- Created: August 29, 2025
-- Author: Lead Refactoring Architect
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BACKUP TABLE CREATION
-- Create backup tables with timestamp suffix to preserve existing data
-- ============================================================================

-- Generate timestamp for backup table naming
DO $$
DECLARE
    backup_suffix TEXT := to_char(NOW(), 'YYYYMMDD_HH24MISS');
BEGIN
    -- Store the backup suffix for use in subsequent scripts
    PERFORM set_config('migration.backup_suffix', backup_suffix, false);
    
    RAISE NOTICE 'Creating backup tables with suffix: %', backup_suffix;
END $$;

-- ============================================================================
-- 1. BACKUP USERS TABLE
-- ============================================================================

-- Create backup of existing users table
DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    table_exists BOOLEAN;
    backup_table_name TEXT;
BEGIN
    backup_table_name := 'users_backup_' || backup_suffix;
    
    -- Check if users table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Create backup table with all existing data
        EXECUTE format('CREATE TABLE %I AS SELECT * FROM users', backup_table_name);
        
        -- Add backup metadata
        EXECUTE format('ALTER TABLE %I ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW()', backup_table_name);
        EXECUTE format('COMMENT ON TABLE %I IS ''Backup of users table created during migration on %s''', 
                      backup_table_name, NOW()::TEXT);
        
        RAISE NOTICE 'Created backup table: %', backup_table_name;
        
        -- Log backup statistics
        EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name);
        GET DIAGNOSTICS table_exists = FOUND;
        RAISE NOTICE 'Backed up % users records', (SELECT COUNT(*) FROM users);
    ELSE
        RAISE NOTICE 'Users table does not exist - skipping backup';
    END IF;
END $$;

-- ============================================================================
-- 2. BACKUP COMICS TABLE
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    table_exists BOOLEAN;
    backup_table_name TEXT;
    record_count INTEGER;
BEGIN
    backup_table_name := 'comics_backup_' || backup_suffix;
    
    -- Check if comics table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comics'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Create backup table with all existing data
        EXECUTE format('CREATE TABLE %I AS SELECT * FROM comics', backup_table_name);
        
        -- Add backup metadata
        EXECUTE format('ALTER TABLE %I ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW()', backup_table_name);
        EXECUTE format('COMMENT ON TABLE %I IS ''Backup of comics table created during migration on %s''', 
                      backup_table_name, NOW()::TEXT);
        
        -- Get and display record count
        EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO record_count;
        RAISE NOTICE 'Created backup table: % with % records', backup_table_name, record_count;
    ELSE
        RAISE NOTICE 'Comics table does not exist - skipping backup';
    END IF;
END $$;

-- ============================================================================
-- 3. BACKUP USER_COLLECTION TABLE
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    table_exists BOOLEAN;
    backup_table_name TEXT;
    record_count INTEGER;
BEGIN
    backup_table_name := 'user_collection_backup_' || backup_suffix;
    
    -- Check if user_collection table exists (try multiple possible names)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('user_collection', 'user_collections', 'collections')
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Determine the actual table name
        DECLARE
            actual_table_name TEXT;
        BEGIN
            SELECT table_name INTO actual_table_name
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('user_collection', 'user_collections', 'collections')
            LIMIT 1;
            
            -- Create backup table with all existing data
            EXECUTE format('CREATE TABLE %I AS SELECT * FROM %I', backup_table_name, actual_table_name);
            
            -- Add backup metadata
            EXECUTE format('ALTER TABLE %I ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW()', backup_table_name);
            EXECUTE format('COMMENT ON TABLE %I IS ''Backup of %s table created during migration on %s''', 
                          backup_table_name, actual_table_name, NOW()::TEXT);
            
            -- Get and display record count
            EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO record_count;
            RAISE NOTICE 'Created backup table: % with % records (from %)', backup_table_name, record_count, actual_table_name;
        END;
    ELSE
        RAISE NOTICE 'User collection table does not exist - skipping backup';
    END IF;
END $$;

-- ============================================================================
-- 4. BACKUP ANY EXISTING WISHLIST DATA
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    table_exists BOOLEAN;
    backup_table_name TEXT;
    actual_table_name TEXT;
    record_count INTEGER;
BEGIN
    backup_table_name := 'wishlist_backup_' || backup_suffix;
    
    -- Check if any wishlist-related table exists
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('wishlist', 'wishlists', 'wishlist_items', 'want_list', 'wants')
    LIMIT 1;
    
    IF actual_table_name IS NOT NULL THEN
        -- Create backup table with all existing data
        EXECUTE format('CREATE TABLE %I AS SELECT * FROM %I', backup_table_name, actual_table_name);
        
        -- Add backup metadata
        EXECUTE format('ALTER TABLE %I ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW()', backup_table_name);
        EXECUTE format('COMMENT ON TABLE %I IS ''Backup of %s table created during migration on %s''', 
                      backup_table_name, actual_table_name, NOW()::TEXT);
        
        -- Get and display record count
        EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO record_count;
        RAISE NOTICE 'Created backup table: % with % records (from %)', backup_table_name, record_count, actual_table_name;
    ELSE
        RAISE NOTICE 'No existing wishlist table found - skipping backup';
    END IF;
END $$;

-- ============================================================================
-- 5. BACKUP ANY EXISTING ALERT/NOTIFICATION DATA
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    table_exists BOOLEAN;
    backup_table_name TEXT;
    actual_table_name TEXT;
    record_count INTEGER;
BEGIN
    backup_table_name := 'alerts_backup_' || backup_suffix;
    
    -- Check if any alert-related table exists
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('alerts', 'notifications', 'alert_settings', 'user_alerts')
    LIMIT 1;
    
    IF actual_table_name IS NOT NULL THEN
        -- Create backup table with all existing data
        EXECUTE format('CREATE TABLE %I AS SELECT * FROM %I', backup_table_name, actual_table_name);
        
        -- Add backup metadata
        EXECUTE format('ALTER TABLE %I ADD COLUMN backup_created_at TIMESTAMP DEFAULT NOW()', backup_table_name);
        EXECUTE format('COMMENT ON TABLE %I IS ''Backup of %s table created during migration on %s''', 
                      backup_table_name, actual_table_name, NOW()::TEXT);
        
        -- Get and display record count
        EXECUTE format('SELECT COUNT(*) FROM %I', backup_table_name) INTO record_count;
        RAISE NOTICE 'Created backup table: % with % records (from %)', backup_table_name, record_count, actual_table_name;
    ELSE
        RAISE NOTICE 'No existing alert table found - skipping backup';
    END IF;
END $$;

-- ============================================================================
-- 6. CREATE BACKUP METADATA TABLE
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    metadata_table_name TEXT;
BEGIN
    metadata_table_name := 'migration_backup_metadata_' || backup_suffix;
    
    -- Create metadata table to track all backups
    EXECUTE format('CREATE TABLE %I (
        id SERIAL PRIMARY KEY,
        original_table_name VARCHAR(100) NOT NULL,
        backup_table_name VARCHAR(150) NOT NULL,
        record_count INTEGER,
        backup_created_at TIMESTAMP DEFAULT NOW(),
        migration_phase VARCHAR(50) DEFAULT ''Phase 2 - Database Migration'',
        notes TEXT
    )', metadata_table_name);
    
    RAISE NOTICE 'Created backup metadata table: %', metadata_table_name;
    
    -- Insert metadata for each backup created
    EXECUTE format('INSERT INTO %I (original_table_name, backup_table_name, record_count, notes) 
                   SELECT ''users'', ''users_backup_%s'', 
                          (SELECT COUNT(*) FROM users_backup_%s), 
                          ''Full backup of users table before schema migration''
                   WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''users_backup_%s'')',
                   metadata_table_name, backup_suffix, backup_suffix, backup_suffix);
    
    EXECUTE format('INSERT INTO %I (original_table_name, backup_table_name, record_count, notes) 
                   SELECT ''comics'', ''comics_backup_%s'', 
                          (SELECT COUNT(*) FROM comics_backup_%s), 
                          ''Full backup of comics table before schema migration''
                   WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = ''comics_backup_%s'')',
                   metadata_table_name, backup_suffix, backup_suffix, backup_suffix);
END $$;

-- ============================================================================
-- 7. BACKUP VERIFICATION
-- ============================================================================

-- Create a view to easily check backup status
DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    view_name TEXT;
BEGIN
    view_name := 'backup_status_' || backup_suffix;
    
    EXECUTE format('CREATE VIEW %I AS
        SELECT 
            schemaname,
            tablename,
            CASE 
                WHEN tablename LIKE ''%%_backup_%%'' THEN ''BACKUP''
                ELSE ''ORIGINAL''
            END as table_type,
            pg_size_pretty(pg_total_relation_size(schemaname||''.''||tablename)) as size
        FROM pg_tables 
        WHERE schemaname = ''public''
        AND (tablename IN (''users'', ''comics'', ''user_collection'', ''user_collections'', ''collections'') 
             OR tablename LIKE ''%%_backup_%s'')
        ORDER BY table_type, tablename', view_name, backup_suffix);
        
    RAISE NOTICE 'Created backup status view: %', view_name;
END $$;

-- ============================================================================
-- BACKUP COMPLETION SUMMARY
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := current_setting('migration.backup_suffix');
    total_backups INTEGER;
BEGIN
    -- Count total backup tables created
    SELECT COUNT(*) INTO total_backups
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%_backup_' || backup_suffix;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'BACKUP COMPLETION SUMMARY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Backup timestamp suffix: %', backup_suffix;
    RAISE NOTICE 'Total backup tables created: %', total_backups;
    RAISE NOTICE 'Backup verification view created: backup_status_%', backup_suffix;
    RAISE NOTICE 'Metadata tracking table: migration_backup_metadata_%', backup_suffix;
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'IMPORTANT: Keep backup tables until migration is fully validated!';
    RAISE NOTICE 'To view backup status, run: SELECT * FROM backup_status_%;', backup_suffix;
    RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- BACKUP SCRIPT COMPLETION
-- ============================================================================

-- Log completion
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0)
ON CONFLICT DO NOTHING; -- This is just to ensure we can log

RAISE NOTICE 'Backup script 001_backup_critical_data.sql completed successfully at %', NOW();

-- End of script
