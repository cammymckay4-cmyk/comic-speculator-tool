-- Create profiles table for public user data
-- This table stores only public information and has a one-to-one relationship with auth.users

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Everyone can read profiles (public data)
CREATE POLICY "Profiles are publicly readable" ON public.profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can only insert their own profile (though this will be handled by trigger)
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to generate a unique username from email
CREATE OR REPLACE FUNCTION public.generate_username_from_email(email text)
RETURNS text AS $$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  -- Extract the part before @ and clean it
  base_username := lower(split_part(email, '@', 1));
  
  -- Remove any non-alphanumeric characters except underscore
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '', 'g');
  
  -- Ensure minimum length
  IF char_length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  -- Ensure maximum length
  IF char_length(base_username) > 25 THEN
    base_username := left(base_username, 25);
  END IF;
  
  -- Start with the base username
  final_username := base_username;
  
  -- Check for uniqueness and add numbers if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := left(base_username, 25 - char_length(counter::text)) || counter::text;
  END LOOP;
  
  RETURN final_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  generated_username text;
BEGIN
  -- Only proceed if this is a new user signup and email is confirmed or raw_user_meta_data exists
  IF TG_OP = 'INSERT' THEN
    
    -- Generate a unique username from email
    generated_username := public.generate_username_from_email(NEW.email);
    
    -- Insert a new profile
    INSERT INTO public.profiles (
      id,
      username,
      avatar_url,
      bio
    ) VALUES (
      NEW.id,
      generated_username,
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
      NULL
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users for profile creation
DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
CREATE TRIGGER trigger_create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Create an updated_at trigger function for profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();