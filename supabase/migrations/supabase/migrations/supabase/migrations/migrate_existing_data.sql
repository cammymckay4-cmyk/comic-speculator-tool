-- ============================================================================
-- ComicScoutUK Database Migration - Phase 2
-- Script: 003_migrate_existing_data.sql
-- Purpose: Migrate and transform existing data to new schema structure
-- Created: August 29, 2025
-- Author: Lead Refactoring Architect
-- ============================================================================

-- Enable extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MIGRATION PREPARATION
-- ============================================================================

-- Create a temporary table to track migration progress
CREATE TEMP TABLE migration_progress (
    step_name VARCHAR(100) PRIMARY KEY,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    records_processed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT
);

-- Helper function to log migration steps
CREATE OR REPLACE FUNCTION log_migration_step(
    step_name VARCHAR(100),
    records_count INTEGER DEFAULT 0,
    step_status VARCHAR(20) DEFAULT 'COMPLETED',
    error_msg TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    UPDATE migration_progress 
    SET end_time = NOW(), 
        records_processed = records_count,
        status = step_status,
        error_message = error_msg
    WHERE step_name = log_migration_step.step_name;
    
    IF NOT FOUND THEN
        INSERT INTO migration_progress (step_name, end_time, records_processed, status, error_message)
        VALUES (log_migration_step.step_name, NOW(), records_count, step_status, error_msg);
    END IF;
    
    RAISE NOTICE 'Migration Step: % - % (% records)', step_name, step_status, records_count;
END;
$$ LANGUAGE plpgsql;

-- Initialize migration tracking
INSERT INTO migration_progress (step_name, status) VALUES 
('MIGRATION_START', 'IN_PROGRESS'),
('USERS_MIGRATION', 'PENDING'),
('COMICS_MIGRATION', 'PENDING'),
('COLLECTION_MIGRATION', 'PENDING'),
('DATA_TRANSFORMATION', 'PENDING'),
('REFERENCE_DATA', 'PENDING');

RAISE NOTICE '============================================================================';
RAISE NOTICE 'STARTING DATA MIGRATION - Phase 2';
RAISE NOTICE 'Migration started at: %', NOW();
RAISE NOTICE '============================================================================';

-- ============================================================================
-- 1. MIGRATE USERS DATA
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := (SELECT regexp_replace(table_name, '.*_backup_', '') 
                          FROM information_schema.tables 
                          WHERE table_name LIKE 'users_backup_%' 
                          LIMIT 1);
    source_table TEXT;
    migrated_count INTEGER := 0;
    existing_users_count INTEGER := 0;
BEGIN
    -- Check if we have a backup table to migrate from
    IF backup_suffix IS NOT NULL THEN
        source_table := 'users_backup_' || backup_suffix;
        
        RAISE NOTICE 'Migrating users from backup table: %', source_table;
        
        -- Check if target users table has any existing data
        SELECT COUNT(*) INTO existing_users_count FROM users;
        
        IF existing_users_count > 0 THEN
            RAISE NOTICE 'Target users table already contains % records - skipping migration', existing_users_count;
            PERFORM log_migration_step('USERS_MIGRATION', existing_users_count, 'SKIPPED', 'Target table already populated');
        ELSE
            -- Migrate users data with field mapping
            EXECUTE format('
                INSERT INTO users (
                    user_id,
                    email,
                    password_hash,
                    subscription_tier,
                    profile_is_public,
                    display_name,
                    created_at,
                    updated_at
                )
                SELECT 
                    COALESCE(user_id, gen_random_uuid()),
                    email,
                    COALESCE(password_hash, password, auth_password), -- Handle different possible column names
                    COALESCE(subscription_tier, tier, plan, ''free''),
                    COALESCE(profile_is_public, is_public, public_profile, false),
                    COALESCE(display_name, username, name, split_part(email, ''@'', 1)),
                    COALESCE(created_at, created, registration_date, NOW()),
                    COALESCE(updated_at, updated, modified_at, NOW())
                FROM %I
                WHERE email IS NOT NULL
                ON CONFLICT (email) DO UPDATE SET
                    display_name = COALESCE(EXCLUDED.display_name, users.display_name),
                    subscription_tier = COALESCE(EXCLUDED.subscription_tier, users.subscription_tier),
                    updated_at = NOW()
            ', source_table);
            
            GET DIAGNOSTICS migrated_count = ROW_COUNT;
            
            -- Update user statistics
            UPDATE users SET 
                total_comics_owned = (
                    SELECT COUNT(*) 
                    FROM user_collection 
                    WHERE user_collection.user_id = users.user_id
                ),
                total_collection_value = (
                    SELECT COALESCE(SUM(current_value), 0) 
                    FROM user_collection 
                    WHERE user_collection.user_id = users.user_id
                );
            
            PERFORM log_migration_step('USERS_MIGRATION', migrated_count);
            RAISE NOTICE 'Successfully migrated % users', migrated_count;
        END IF;
    ELSE
        -- No backup table found, check if original table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
            SELECT COUNT(*) INTO existing_users_count FROM users;
            PERFORM log_migration_step('USERS_MIGRATION', existing_users_count, 'EXISTING_DATA', 'Using existing users table');
            RAISE NOTICE 'Using existing users table with % records', existing_users_count;
        ELSE
            PERFORM log_migration_step('USERS_MIGRATION', 0, 'NO_SOURCE', 'No source users table found');
            RAISE NOTICE 'No users data to migrate - starting with empty users table';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 2. MIGRATE COMICS DATA
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := (SELECT regexp_replace(table_name, '.*_backup_', '') 
                          FROM information_schema.tables 
                          WHERE table_name LIKE 'comics_backup_%' 
                          LIMIT 1);
    source_table TEXT;
    migrated_count INTEGER := 0;
    existing_comics_count INTEGER := 0;
BEGIN
    -- Check if we have a backup table to migrate from
    IF backup_suffix IS NOT NULL THEN
        source_table := 'comics_backup_' || backup_suffix;
        
        RAISE NOTICE 'Migrating comics from backup table: %', source_table;
        
        -- Check if target comics table has any existing data
        SELECT COUNT(*) INTO existing_comics_count FROM comics;
        
        IF existing_comics_count > 0 THEN
            RAISE NOTICE 'Target comics table already contains % records - skipping migration', existing_comics_count;
            PERFORM log_migration_step('COMICS_MIGRATION', existing_comics_count, 'SKIPPED', 'Target table already populated');
        ELSE
            -- Migrate comics data with field mapping and data cleaning
            EXECUTE format('
                INSERT INTO comics (
                    comic_id,
                    title,
                    issue_number,
                    publisher,
                    publication_date,
                    cover_image_url,
                    description,
                    created_at,
                    updated_at
                )
                SELECT 
                    COALESCE(comic_id, id, gen_random_uuid()),
                    TRIM(COALESCE(title, comic_title, name)),
                    TRIM(COALESCE(issue_number, issue_num, issue, ''1'')),
                    TRIM(COALESCE(publisher, pub, publisher_name, ''Unknown'')),
                    COALESCE(publication_date, pub_date, release_date, created_at::date),
                    COALESCE(cover_image_url, image_url, cover_url),
                    COALESCE(description, desc, summary),
                    COALESCE(created_at, created, NOW()),
                    COALESCE(updated_at, updated, modified_at, NOW())
                FROM %I
                WHERE title IS NOT NULL 
                  AND title != ''''
                  AND issue_number IS NOT NULL
                  AND publisher IS NOT NULL
                ON CONFLICT (title, issue_number, publisher) DO UPDATE SET
                    description = COALESCE(EXCLUDED.description, comics.description),
                    cover_image_url = COALESCE(EXCLUDED.cover_image_url, comics.cover_image_url),
                    publication_date = COALESCE(EXCLUDED.publication_date, comics.publication_date),
                    updated_at = NOW()
            ', source_table);
            
            GET DIAGNOSTICS migrated_count = ROW_COUNT;
            PERFORM log_migration_step('COMICS_MIGRATION', migrated_count);
            RAISE NOTICE 'Successfully migrated % comics', migrated_count;
        END IF;
    ELSE
        -- Check for existing comics table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comics' AND table_schema = 'public') THEN
            SELECT COUNT(*) INTO existing_comics_count FROM comics;
            PERFORM log_migration_step('COMICS_MIGRATION', existing_comics_count, 'EXISTING_DATA', 'Using existing comics table');
            RAISE NOTICE 'Using existing comics table with % records', existing_comics_count;
        ELSE
            PERFORM log_migration_step('COMICS_MIGRATION', 0, 'NO_SOURCE', 'No source comics table found');
            RAISE NOTICE 'No comics data to migrate - starting with empty comics table';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 3. MIGRATE USER COLLECTION DATA
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := (SELECT regexp_replace(table_name, '.*_backup_', '') 
                          FROM information_schema.tables 
                          WHERE table_name LIKE '%collection%_backup_%' 
                          LIMIT 1);
    source_table TEXT;
    migrated_count INTEGER := 0;
    existing_collection_count INTEGER := 0;
BEGIN
    -- Determine source table name
    IF backup_suffix IS NOT NULL THEN
        SELECT table_name INTO source_table
        FROM information_schema.tables 
        WHERE table_name LIKE '%collection%_backup_' || backup_suffix
        LIMIT 1;
        
        RAISE NOTICE 'Migrating collection from backup table: %', source_table;
        
        -- Check if target table has existing data
        SELECT COUNT(*) INTO existing_collection_count FROM user_collection;
        
        IF existing_collection_count > 0 THEN
            RAISE NOTICE 'Target user_collection table already contains % records - skipping migration', existing_collection_count;
            PERFORM log_migration_step('COLLECTION_MIGRATION', existing_collection_count, 'SKIPPED', 'Target table already populated');
        ELSE
            -- Migrate collection data with comprehensive field mapping
            EXECUTE format('
                INSERT INTO user_collection (
                    entry_id,
                    user_id,
                    comic_id,
                    purchase_price,
                    purchase_date,
                    grade,
                    grader,
                    condition_notes,
                    user_submitted_image_url,
                    is_for_sale,
                    personal_notes,
                    created_at,
                    updated_at
                )
                SELECT 
                    COALESCE(entry_id, id, gen_random_uuid()),
                    COALESCE(user_id, owner_id),
                    COALESCE(comic_id, book_id),
                    CASE 
                        WHEN purchase_price IS NOT NULL AND purchase_price > 0 THEN purchase_price
                        WHEN price IS NOT NULL AND price > 0 THEN price
                        WHEN cost IS NOT NULL AND cost > 0 THEN cost
                        ELSE NULL
                    END,
                    COALESCE(purchase_date, acquired_date, date_added, created_at::date),
                    TRIM(COALESCE(grade, condition, rating)),
                    TRIM(COALESCE(grader, grading_company, cert_company)),
                    COALESCE(condition_notes, notes, comments),
                    COALESCE(user_submitted_image_url, image_url, photo_url),
                    COALESCE(is_for_sale, for_sale, selling, false),
                    COALESCE(personal_notes, user_notes, description),
                    COALESCE(created_at, added_at, created, NOW()),
                    COALESCE(updated_at, modified_at, updated, NOW())
                FROM %I source
                WHERE source.user_id IS NOT NULL 
                  AND source.comic_id IS NOT NULL
                  AND EXISTS (SELECT 1 FROM users WHERE users.user_id = source.user_id)
                  AND EXISTS (SELECT 1 FROM comics WHERE comics.comic_id = source.comic_id)
                ON CONFLICT (user_id, comic_id) DO UPDATE SET
                    purchase_price = COALESCE(EXCLUDED.purchase_price, user_collection.purchase_price),
                    purchase_date = COALESCE(EXCLUDED.purchase_date, user_collection.purchase_date),
                    grade = COALESCE(EXCLUDED.grade, user_collection.grade),
                    grader = COALESCE(EXCLUDED.grader, user_collection.grader),
                    updated_at = NOW()
            ', source_table);
            
            GET DIAGNOSTICS migrated_count = ROW_COUNT;
            
            -- Update current values based on market data (if available)
            UPDATE user_collection 
            SET current_value = COALESCE(
                (SELECT fair_market_value 
                 FROM market_data 
                 WHERE market_data.comic_id = user_collection.comic_id 
                   AND market_data.grade = user_collection.grade 
                 LIMIT 1),
                purchase_price
            )
            WHERE current_value IS NULL;
            
            PERFORM log_migration_step('COLLECTION_MIGRATION', migrated_count);
            RAISE NOTICE 'Successfully migrated % collection entries', migrated_count;
        END IF;
    ELSE
        -- Check for existing collection table
        SELECT table_name INTO source_table
        FROM information_schema.tables 
        WHERE table_name IN ('user_collection', 'user_collections', 'collections')
          AND table_schema = 'public'
        LIMIT 1;
        
        IF source_table IS NOT NULL THEN
            EXECUTE format('SELECT COUNT(*) FROM %I', source_table) INTO existing_collection_count;
            PERFORM log_migration_step('COLLECTION_MIGRATION', existing_collection_count, 'EXISTING_DATA', 'Using existing collection table');
            RAISE NOTICE 'Using existing collection table: % with % records', source_table, existing_collection_count;
        ELSE
            PERFORM log_migration_step('COLLECTION_MIGRATION', 0, 'NO_SOURCE', 'No source collection table found');
            RAISE NOTICE 'No collection data to migrate - starting with empty collection';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 4. MIGRATE WISHLIST DATA (IF EXISTS)
-- ============================================================================

DO $$
DECLARE
    backup_suffix TEXT := (SELECT regexp_replace(table_name, '.*_backup_', '') 
                          FROM information_schema.tables 
                          WHERE table_name LIKE 'wishlist%_backup_%' 
                          LIMIT 1);
    source_table TEXT;
    migrated_count INTEGER := 0;
BEGIN
    -- Check for wishlist backup table
    IF backup_suffix IS NOT NULL THEN
        SELECT table_name INTO source_table
        FROM information_schema.tables 
        WHERE table_name LIKE 'wishlist%_backup_' || backup_suffix
        LIMIT 1;
        
        RAISE NOTICE 'Migrating wishlist from backup table: %', source_table;
        
        EXECUTE format('
            INSERT INTO wishlist_items (
                want_id,
                user_id,
                comic_id,
                max_price,
                min_grade,
                must_be_graded,
                priority_level,
                notes,
                created_at,
                updated_at
            )
            SELECT 
                COALESCE(want_id, id, gen_random_uuid()),
                user_id,
                comic_id,
                COALESCE(max_price, target_price, budget),
                COALESCE(min_grade, minimum_grade, min_condition),
                COALESCE(must_be_graded, graded_only, false),
                COALESCE(priority_level, priority, 5),
                COALESCE(notes, comments, description),
                COALESCE(created_at, added_at, created, NOW()),
                COALESCE(updated_at, modified_at, NOW())
            FROM %I source
            WHERE source.user_id IS NOT NULL 
              AND source.comic_id IS NOT NULL
              AND EXISTS (SELECT 1 FROM users WHERE users.user_id = source.user_id)
              AND EXISTS (SELECT 1 FROM comics WHERE comics.comic_id = source.comic_id)
            ON CONFLICT (user_id, comic_id) DO NOTHING
        ', source_table);
        
        GET DIAGNOSTICS migrated_count = ROW_COUNT;
        RAISE NOTICE 'Successfully migrated % wishlist entries', migrated_count;
    ELSE
        -- Check for existing wishlist table
        SELECT table_name INTO source_table
        FROM information_schema.tables 
        WHERE table_name IN ('wishlist', 'wishlists', 'wishlist_items', 'want_list', 'wants')
          AND table_schema = 'public'
        LIMIT 1;
        
        IF source_table IS NOT NULL THEN
            RAISE NOTICE 'Found existing wishlist table: %', source_table;
            -- Could implement migration from existing table here
        ELSE
            RAISE NOTICE 'No wishlist data to migrate - starting with empty wishlist system';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 5. DATA TRANSFORMATION AND CLEANUP
-- ============================================================================

DO $$
DECLARE
    transformation_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting data transformation and cleanup...';
    
    -- Clean up comic titles and issue numbers
    UPDATE comics SET 
        title = TRIM(REGEXP_REPLACE(title, '\s+', ' ', 'g')),
        issue_number = TRIM(REGEXP_REPLACE(issue_number, '[^0-9.]', '', 'g'))
    WHERE title != TRIM(REGEXP_REPLACE(title, '\s+', ' ', 'g'))
       OR issue_number != TRIM(REGEXP_REPLACE(issue_number, '[^0-9.]', '', 'g'));
    
    GET DIAGNOSTICS transformation_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned % comic title/issue entries', transformation_count;
    
    -- Standardize grades
    UPDATE user_collection SET
        grade = CASE 
            WHEN grade ILIKE 'mint%' OR grade ILIKE 'nm%' THEN 'NM'
            WHEN grade ILIKE 'very fine%' OR grade ILIKE 'vf%' THEN 'VF'
            WHEN grade ILIKE 'fine%' OR grade ILIKE 'fn%' THEN 'FN'
            WHEN grade ILIKE 'very good%' OR grade ILIKE 'vg%' THEN 'VG'
            WHEN grade ILIKE 'good%' OR grade ILIKE 'gd%' THEN 'GD'
            WHEN grade ILIKE 'fair%' OR grade ILIKE 'fr%' THEN 'FR'
            WHEN grade ILIKE 'poor%' OR grade ILIKE 'pr%' THEN 'PR'
            WHEN grade ~ '^[0-9]+\.?[0-9]*$' AND grade::numeric BETWEEN 0.5 AND 10 THEN grade
            ELSE grade
        END
    WHERE grade IS NOT NULL;
    
    GET DIAGNOSTICS transformation_count = ROW_COUNT;
    RAISE NOTICE 'Standardized % grade entries', transformation_count;
    
    -- Update user statistics
    UPDATE users SET 
        total_comics_owned = (
            SELECT COUNT(*) 
            FROM user_collection 
            WHERE user_collection.user_id = users.user_id
        ),
        total_collection_value = (
            SELECT COALESCE(SUM(COALESCE(current_value, purchase_price)), 0) 
            FROM user_collection 
            WHERE user_collection.user_id = users.user_id
        );
    
    GET DIAGNOSTICS transformation_count = ROW_COUNT;
    RAISE NOTICE 'Updated statistics for % users', transformation_count;
    
    PERFORM log_migration_step('DATA_TRANSFORMATION', transformation_count);
END $$;

-- ============================================================================
-- 6. INSERT REFERENCE DATA AND INITIAL SETTINGS
-- ============================================================================

DO $$
DECLARE
    ref_data_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Inserting reference data and initial settings...';
    
    -- Create default alert settings for all users
    INSERT INTO alert_settings (user_id, alert_type, threshold, notification_methods)
    SELECT 
        user_id,
        'new_deal',
        '{"percentage_below_fmv": 20, "max_alerts_per_day": 5}',
        '["email"]'
    FROM users
    WHERE NOT EXISTS (
        SELECT 1 FROM alert_settings 
        WHERE alert_settings.user_id = users.user_id 
        AND alert_type = 'new_deal'
    );
    
    GET DIAGNOSTICS ref_data_count = ROW_COUNT;
    RAISE NOTICE 'Created default alert settings for % users', ref_data_count;
    
    -- Create basic collection goals for users with collections
    INSERT INTO collection_goals (user_id, goal_type, title, description, target_criteria)
    SELECT 
        user_id,
        'collect_count',
        'Growing Collection',
        'Reach your next collection milestone',
        format('{"target_count": %s}', 
            CASE 
                WHEN total_comics_owned < 50 THEN '50'
                WHEN total_comics_owned < 100 THEN '100'
                WHEN total_comics_owned < 500 THEN '500'
                ELSE '1000'
            END
        )::jsonb
    FROM users
    WHERE total_comics_owned > 0
    AND NOT EXISTS (
        SELECT 1 FROM collection_goals 
        WHERE collection_goals.user_id = users.user_id
    );
    
    GET DIAGNOSTICS ref_data_count = ROW_COUNT;
    RAISE NOTICE 'Created collection goals for % users', ref_data_count;
    
    PERFORM log_migration_step('REFERENCE_DATA', ref_data_count);
END $$;

-- ============================================================================
-- 7. UPDATE COMPUTED FIELDS AND STATISTICS
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Updating computed fields and statistics...';
    
    -- Update search vectors for all comics
    UPDATE comics SET search_vector = to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(publisher, '') || ' ' || 
        COALESCE(description, '')
    );
    
    -- Recalculate profit/loss for all collection items
    -- (This is handled by the generated column, but we'll trigger an update)
    UPDATE user_collection SET updated_at = updated_at WHERE current_value IS NOT NULL AND purchase_price IS NOT NULL;
    
    -- Update trophy progress for users
    -- Check for "First Comic" trophy
    INSERT INTO user_trophies (user_id, trophy_id, earned_date)
    SELECT 
        u.user_id,
        t.trophy_id,
        (SELECT MIN(created_at) FROM user_collection WHERE user_id = u.user_id)
    FROM users u
    CROSS JOIN trophies t
    WHERE t.name = 'First Comic'
      AND u.total_comics_owned >= 1
      AND NOT EXISTS (
          SELECT 1 FROM user_trophies ut 
          WHERE ut.user_id = u.user_id AND ut.trophy_id = t.trophy_id
      );
    
    -- Check for other collection-based trophies
    INSERT INTO user_trophies (user_id, trophy_id, earned_date)
    SELECT DISTINCT
        u.user_id,
        t.trophy_id,
        NOW()
    FROM users u
    CROSS JOIN trophies t
    WHERE (
        (t.name = 'Century Club' AND u.total_comics_owned >= 100) OR
        (t.name = 'Thousand Club' AND u.total_comics_owned >= 1000) OR
        (t.name = 'High Roller' AND u.total_collection_value >= 1000) OR
        (t.name = 'Big Spender' AND u.total_collection_value >= 10000)
    )
    AND NOT EXISTS (
        SELECT 1 FROM user_trophies ut 
        WHERE ut.user_id = u.user_id AND ut.trophy_id = t.trophy_id
    );
    
    RAISE NOTICE 'Updated computed fields and awarded initial trophies';
END $$;

-- ============================================================================
-- MIGRATION COMPLETION
-- ============================================================================

-- Update final migration status
PERFORM log_migration_step('MIGRATION_START', 
    (SELECT SUM(records_processed) FROM migration_progress WHERE status = 'COMPLETED'),
    'COMPLETED'
);

-- Create migration summary report
CREATE TEMP VIEW migration_summary AS
SELECT 
    step_name,
    status,
    records_processed,
    EXTRACT(EPOCH FROM (end_time - start_time))::INTEGER as duration_seconds,
    error_message
FROM migration_progress
ORDER BY start_time;

-- Display migration summary
DO $$
DECLARE
    rec RECORD;
    total_records INTEGER := 0;
    total_duration INTEGER := 0;
    failed_steps INTEGER := 0;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATA MIGRATION COMPLETION SUMMARY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Step                    | Status      | Records | Duration | Error';
    RAISE NOTICE '------------------------|-------------|---------|----------|---------------';
    
    FOR rec IN SELECT * FROM migration_summary LOOP
        RAISE NOTICE '%-22s | %-11s | %7s | %6ss   | %s', 
            rec.step_name, 
            rec.status, 
            COALESCE(rec.records_processed::text, 'N/A'),
            COALESCE(rec.duration_seconds::text, 'N/A'),
            COALESCE(SUBSTRING(rec.error_message, 1, 15), '');
        
        total_records := total_records + COALESCE(rec.records_processed, 0);
        total_duration := total_duration + COALESCE(rec.duration_seconds, 0);
        
        IF rec.status IN ('FAILED', 'ERROR') THEN
            failed_steps := failed_steps + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'MIGRATION TOTALS:';
    RAISE NOTICE 'Total Records Processed: %', total_records;
    RAISE NOTICE 'Total Duration: %s seconds', total_duration;
    RAISE NOTICE 'Failed Steps: %', failed_steps;
    
    IF failed_steps = 0 THEN
        RAISE NOTICE 'Migration Status: SUCCESS ✓';
        RAISE NOTICE '';
        RAISE NOTICE 'Current Database State:';
        RAISE NOTICE '- Users: % records', (SELECT COUNT(*) FROM users);
        RAISE NOTICE '- Comics: % records', (SELECT COUNT(*) FROM comics);
        RAISE NOTICE '- User Collections: % records', (SELECT COUNT(*) FROM user_collection);
        RAISE NOTICE '- Wishlist Items: % records', (SELECT COUNT(*) FROM wishlist_items);
        RAISE NOTICE '- Trophies Earned: % records', (SELECT COUNT(*) FROM user_trophies);
        RAISE NOTICE '- Alert Settings: % records', (SELECT COUNT(*) FROM alert_settings);
    ELSE
        RAISE NOTICE 'Migration Status: PARTIAL - % steps failed', failed_steps;
        RAISE NOTICE 'Review error messages above and run validation script';
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run validation script: 004_data_validation.sql';
    RAISE NOTICE '2. Test application functionality';
    RAISE NOTICE '3. If validation passes, run cleanup: 005_cleanup_old_tables.sql';
    RAISE NOTICE '============================================================================';
END $$;

-- Store migration log for future reference
CREATE TABLE IF NOT EXISTS migration_history AS
SELECT 
    NOW() as migration_date,
    'Phase 2 - Data Migration' as migration_type,
    step_name,
    status,
    records_processed,
    start_time,
    end_time,
    error_message
FROM migration_progress;

-- Final log entry
RAISE NOTICE 'Data migration script 003_migrate_existing_data.sql completed at %', NOW();

-- End of script
