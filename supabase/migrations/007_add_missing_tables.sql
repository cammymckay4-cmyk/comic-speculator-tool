-- Migration: Add missing database tables for backend improvements
-- Created: 2025-08-30
-- Description: Adds user_activity_log, system_metrics, and user_preferences tables

-- User Activity Log Table
-- Tracks user actions and behavior for analytics and auditing
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'login', 'logout', 'collection_add', 'collection_remove', 'collection_update',
    'wishlist_add', 'wishlist_remove', 'deal_view', 'search', 'profile_update',
    'alert_create', 'alert_update', 'alert_delete', 'export_data', 'import_data'
  )),
  activity_description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_activity_log_user_id ON user_activity_log(user_id),
  INDEX idx_user_activity_log_created_at ON user_activity_log(created_at),
  INDEX idx_user_activity_log_activity_type ON user_activity_log(activity_type)
);

-- System Metrics Table
-- Stores system performance and usage metrics
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,6) NOT NULL,
  metric_unit VARCHAR(20) DEFAULT 'count',
  metric_category VARCHAR(50) DEFAULT 'general' CHECK (metric_category IN (
    'performance', 'usage', 'error', 'business', 'general'
  )),
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_system_metrics_name_recorded_at ON system_metrics(metric_name, recorded_at),
  INDEX idx_system_metrics_category ON system_metrics(metric_category),
  INDEX idx_system_metrics_recorded_at ON system_metrics(recorded_at)
);

-- User Preferences Table
-- Stores user-specific settings and preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Display preferences
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  currency VARCHAR(3) DEFAULT 'GBP' CHECK (currency IN ('USD', 'GBP', 'EUR', 'CAD', 'AUD')),
  timezone VARCHAR(50) DEFAULT 'Europe/London',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY' CHECK (date_format IN ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  alert_frequency VARCHAR(20) DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  price_alert_threshold DECIMAL(5,2) DEFAULT 10.00 CHECK (price_alert_threshold >= 0),
  
  -- Privacy preferences
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  collection_visibility VARCHAR(20) DEFAULT 'public' CHECK (collection_visibility IN ('public', 'friends', 'private')),
  
  -- Feature preferences
  auto_update_prices BOOLEAN DEFAULT true,
  show_deals_in_collection BOOLEAN DEFAULT true,
  enable_price_history BOOLEAN DEFAULT true,
  default_grade_filter VARCHAR(20) DEFAULT 'all',
  
  -- Advanced preferences (JSONB for flexibility)
  advanced_settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_user_preferences_user_id ON user_preferences(user_id)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- User Activity Log Policies
-- Users can only see their own activity logs
CREATE POLICY "Users can view their own activity logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert activity logs (via application)
CREATE POLICY "Authenticated users can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- System Metrics Policies
-- Only service accounts can read system metrics (for admin dashboard)
CREATE POLICY "Service accounts can view system metrics" ON system_metrics
  FOR SELECT USING (auth.role() = 'service_role');

-- Only service accounts can insert system metrics
CREATE POLICY "Service accounts can insert system metrics" ON system_metrics
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- User Preferences Policies
-- Users can view and update their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_preferences updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create default user preferences when user signs up
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default preferences for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_user_preferences();

-- Insert initial system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, metric_category, tags) VALUES
('database_migration_007', 1, 'count', 'general', '{"migration": "add_missing_tables", "version": "007"}'),
('tables_created', 3, 'count', 'general', '{"tables": ["user_activity_log", "system_metrics", "user_preferences"]}')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT ON user_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_preferences TO authenticated;
GRANT SELECT, INSERT ON system_metrics TO service_role;

-- Comments for documentation
COMMENT ON TABLE user_activity_log IS 'Tracks user actions and behavior for analytics and auditing purposes';
COMMENT ON TABLE system_metrics IS 'Stores system performance metrics and usage statistics';
COMMENT ON TABLE user_preferences IS 'User-specific settings and preferences for the application';

COMMENT ON COLUMN user_activity_log.metadata IS 'Additional context data stored as JSON';
COMMENT ON COLUMN system_metrics.tags IS 'Key-value pairs for metric categorization and filtering';
COMMENT ON COLUMN user_preferences.advanced_settings IS 'Flexible storage for advanced user settings';