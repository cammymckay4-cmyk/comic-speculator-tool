-- Fix alerts table user_id to use UUID instead of TEXT
-- This aligns with the auth.users table and other tables in the system

-- First, drop the existing RLS policies
DROP POLICY IF EXISTS "Users can view their own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can create their own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can delete their own alerts" ON alerts;

-- Drop the existing indexes that depend on user_id
DROP INDEX IF EXISTS alerts_user_id_idx;

-- Change the user_id column type from TEXT to UUID and add foreign key constraint
ALTER TABLE alerts 
  ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
  ADD CONSTRAINT alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Recreate the index for better query performance
CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id);

-- Create updated RLS policies using auth.uid() instead of current_user_email()
CREATE POLICY "Users can view their own alerts" ON alerts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own alerts" ON alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own alerts" ON alerts
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own alerts" ON alerts
  FOR DELETE USING (user_id = auth.uid());

-- Drop the custom function since it's no longer needed
DROP FUNCTION IF EXISTS current_user_email();