-- Create a trigger to send confirmation emails when new users sign up
-- This replaces the built-in Supabase email functionality

-- First, create a function that will call our Edge Function
CREATE OR REPLACE FUNCTION handle_new_user_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  confirmation_url text;
  function_url text;
  headers json;
  payload json;
  result json;
BEGIN
  -- Only proceed if this is a new user signup (not an update)
  IF TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NULL THEN
    
    -- Generate the confirmation URL
    -- This uses Supabase's built-in confirmation token generation
    confirmation_url := current_setting('app.settings.api_url', true) || 
                       '/auth/v1/verify?token=' || NEW.confirmation_token || 
                       '&type=signup&redirect_to=' || 
                       coalesce(current_setting('app.settings.site_url', true), 'http://localhost:3000');
    
    -- Prepare the payload for our Edge Function
    payload := json_build_object(
      'email', NEW.email,
      'confirmation_url', confirmation_url
    );
    
    -- Call our Edge Function using the HTTP extension
    -- Note: This requires the http extension to be enabled
    SELECT
      status,
      content::json
    FROM
      http((
        'POST',
        current_setting('app.settings.api_url', true) || '/functions/v1/send-confirmation-email',
        ARRAY[
          http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)),
          http_header('Content-Type', 'application/json')
        ],
        'application/json',
        payload::text
      )::http_request) INTO result;
    
    -- Log the result (optional, for debugging)
    INSERT INTO auth.audit_log_entries (
      instance_id,
      id,
      payload,
      created_at,
      ip_address
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      json_build_object(
        'action', 'confirmation_email_sent',
        'user_id', NEW.id,
        'email', NEW.email,
        'result', result
      ),
      now(),
      '127.0.0.1'
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_send_confirmation_email ON auth.users;
CREATE TRIGGER trigger_send_confirmation_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_confirmation();

-- Enable the http extension if it's not already enabled
-- Note: This might require superuser privileges in some setups
CREATE EXTENSION IF NOT EXISTS http;