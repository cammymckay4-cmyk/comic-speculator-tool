-- =====================================================
-- ComicScoutUK Database Migration: Row Level Security
-- File: 002_row_level_security.sql
-- Description: Comprehensive RLS policies for security and multi-tenancy
-- =====================================================

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on data modification tables (admin-controlled)
ALTER TABLE comic_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE comic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE grading_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE normalized_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER MANAGEMENT POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by auth trigger)
CREATE POLICY "users_insert_own" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- USER COLLECTION POLICIES
-- =====================================================

-- Users can view their own collections
CREATE POLICY "user_collections_select_own" ON user_collections
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert items to their own collection
CREATE POLICY "user_collections_insert_own" ON user_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own collection items
CREATE POLICY "user_collections_update_own" ON user_collections
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own collection items
CREATE POLICY "user_collections_delete_own" ON user_collections
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- USER ALERT RULES POLICIES
-- =====================================================

-- Users can view their own alert rules
CREATE POLICY "user_alert_rules_select_own" ON user_alert_rules
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own alert rules
CREATE POLICY "user_alert_rules_insert_own" ON user_alert_rules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own alert rules
CREATE POLICY "user_alert_rules_update_own" ON user_alert_rules
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own alert rules
CREATE POLICY "user_alert_rules_delete_own" ON user_alert_rules
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ALERT NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own alert notifications
CREATE POLICY "alert_notifications_select_own" ON alert_notifications
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM user_alert_rules 
            WHERE id = alert_notifications.alert_rule_id
        )
    );

-- Only system can insert alert notifications
CREATE POLICY "alert_notifications_insert_system" ON alert_notifications
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Users can update delivery status (for tracking opens/clicks)
CREATE POLICY "alert_notifications_update_own" ON alert_notifications
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM user_alert_rules 
            WHERE id = alert_notifications.alert_rule_id
        )
    );

-- =====================================================
-- PUBLIC READ ACCESS TO COMIC DATA
-- =====================================================

-- Public read access to comic series data
CREATE POLICY "comic_series_select_all" ON comic_series
    FOR SELECT USING (true);

-- Public read access to comic issues data
CREATE POLICY "comic_issues_select_all" ON comic_issues
    FOR SELECT USING (true);

-- Public read access to grading standards
CREATE POLICY "grading_standards_select_all" ON grading_standards
    FOR SELECT USING (true);

-- Public read access to market values
CREATE POLICY "market_values_select_all" ON market_values
    FOR SELECT USING (true);

-- Public read access to active deals
CREATE POLICY "deals_select_active" ON deals
    FOR SELECT USING (is_active = true);

-- Public read access to normalized listings (for deal details)
CREATE POLICY "normalized_listings_select_all" ON normalized_listings
    FOR SELECT USING (true);

-- =====================================================
-- SYSTEM/SERVICE ROLE POLICIES
-- =====================================================

-- Service role can manage all comic data
CREATE POLICY "comic_series_service_all" ON comic_series
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "comic_issues_service_all" ON comic_issues
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "grading_standards_service_all" ON grading_standards
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Service role can manage data pipeline
CREATE POLICY "raw_listings_service_all" ON raw_listings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "normalized_listings_service_all" ON normalized_listings
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "market_values_service_all" ON market_values
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "deals_service_all" ON deals
    FOR ALL USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- USER CREATION FUNCTION
-- =====================================================

-- Function to automatically create user profile when someone signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        SPLIT_PART(NEW.email, '@', 1), -- Use email prefix as default username
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SECURITY HELPER FUNCTIONS
-- =====================================================

-- Function to check if user owns a collection item
CREATE OR REPLACE FUNCTION user_owns_collection_item(collection_item_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_collections 
        WHERE id = collection_item_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns an alert rule
CREATE OR REPLACE FUNCTION user_owns_alert_rule(alert_rule_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_alert_rules 
        WHERE id = alert_rule_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's collection stats (for dashboard)
CREATE OR REPLACE FUNCTION get_user_collection_stats(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    total_items BIGINT,
    total_value DECIMAL(12,2),
    wishlist_items BIGINT,
    key_issues BIGINT
) AS $$
BEGIN
    -- Verify user can access these stats (own data or public profile)
    IF target_user_id != auth.uid() AND NOT EXISTS (
        SELECT 1 FROM users WHERE id = target_user_id AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_items,
        COALESCE(SUM(uc.current_value), 0)::DECIMAL(12,2) as total_value,
        COUNT(*) FILTER (WHERE uc.is_wishlist_item = true)::BIGINT as wishlist_items,
        COUNT(*) FILTER (WHERE ci.key_issue = true)::BIGINT as key_issues
    FROM user_collections uc
    JOIN comic_issues ci ON uc.issue_id = ci.id
    WHERE uc.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RATE LIMITING SETUP
-- =====================================================

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS user_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint)
);

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
    endpoint_name TEXT,
    max_requests INTEGER DEFAULT 100,
    window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMPTZ;
BEGIN
    -- Get current user
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get or create rate limit record
    INSERT INTO user_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (auth.uid(), endpoint_name, 1, NOW())
    ON CONFLICT (user_id, endpoint) 
    DO UPDATE SET
        request_count = CASE 
            WHEN user_rate_limits.window_start < NOW() - (window_minutes || ' minutes')::INTERVAL 
            THEN 1
            ELSE user_rate_limits.request_count + 1
        END,
        window_start = CASE
            WHEN user_rate_limits.window_start < NOW() - (window_minutes || ' minutes')::INTERVAL 
            THEN NOW()
            ELSE user_rate_limits.window_start
        END,
        updated_at = NOW()
    RETURNING request_count, window_start INTO current_count, window_start;

    -- Check if rate limit exceeded
    RETURN current_count <= max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUDIT LOGGING
-- =====================================================

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        user_id,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        auth.uid(),
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_collections
    AFTER INSERT OR UPDATE OR DELETE ON user_collections
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_alert_rules
    AFTER INSERT OR UPDATE OR DELETE ON user_alert_rules
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();