-- Alternative approach using Supabase Database Webhooks
-- This creates a more reliable trigger system for sending confirmation emails

-- Create a table to track email sending attempts
CREATE TABLE IF NOT EXISTS public.email_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  confirmation_url text NOT NULL,
  sent_at timestamptz,
  attempts int DEFAULT 0,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.email_confirmations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only service role can access)
CREATE POLICY "Service role can manage email confirmations" ON public.email_confirmations
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to insert pending confirmation emails
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  confirmation_url text;
BEGIN
  -- Only proceed if this is a new user signup
  IF TG_OP = 'INSERT' AND NEW.email_confirmed_at IS NULL AND NEW.confirmation_token IS NOT NULL THEN
    
    -- Generate the confirmation URL
    confirmation_url := current_setting('app.settings.site_url', true) || 
                       '/auth/confirm?token=' || NEW.confirmation_token || 
                       '&type=signup';
    
    -- Insert a record to trigger the webhook
    INSERT INTO public.email_confirmations (
      user_id,
      email,
      confirmation_url
    ) VALUES (
      NEW.id,
      NEW.email,
      confirmation_url
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS trigger_new_user_signup ON auth.users;
CREATE TRIGGER trigger_new_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_email_confirmations_updated_at
  BEFORE UPDATE ON public.email_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();