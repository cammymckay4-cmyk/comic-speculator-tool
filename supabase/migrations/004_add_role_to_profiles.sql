-- Add role column to profiles table for user role management

-- Add role column with default value 'user'
ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Create index on role column for efficient queries
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Update existing profiles to have 'user' role if NULL
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;

-- Add RLS policy for admin role management
-- Only admin users can update roles of other users
CREATE POLICY "Admin can manage user roles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

-- Add comment explaining the role column
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default), moderator, or admin';