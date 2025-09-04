-- Create alerts table for user price and availability alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Email-based user ID as used in the application
  comic_id TEXT, -- Optional comic ID for comic-specific alerts
  name TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price-drop', 'price-increase', 'new-issue', 'availability', 'auction-ending', 'market-trend', 'news-mention')),
  threshold_price DECIMAL(10,2), -- Optional price threshold for price-based alerts
  price_direction TEXT CHECK (price_direction IN ('above', 'below')), -- Direction for price alerts
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  description TEXT -- Optional description/notes
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id);
CREATE INDEX IF NOT EXISTS alerts_comic_id_idx ON alerts(comic_id);
CREATE INDEX IF NOT EXISTS alerts_active_idx ON alerts(is_active);
CREATE INDEX IF NOT EXISTS alerts_type_idx ON alerts(alert_type);

-- Enable RLS for security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own alerts
CREATE POLICY "Users can view their own alerts" ON alerts
  FOR SELECT USING (user_id = current_user_email());

CREATE POLICY "Users can create their own alerts" ON alerts
  FOR INSERT WITH CHECK (user_id = current_user_email());

CREATE POLICY "Users can update their own alerts" ON alerts
  FOR UPDATE USING (user_id = current_user_email());

CREATE POLICY "Users can delete their own alerts" ON alerts
  FOR DELETE USING (user_id = current_user_email());

-- Create function to get current user email (if not already exists)
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json ->> 'email',
    (auth.jwt() ->> 'email')::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;