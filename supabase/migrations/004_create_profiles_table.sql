-- Create profiles table with one-to-one relationship to auth.users
-- This table stores public, non-sensitive user data
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for security
alter table profiles enable row level security;

-- RLS policies for profiles table
-- Anyone can read profiles (public data only)
create policy "Profiles are viewable by everyone" 
  on profiles for select 
  using (true);

-- Users can only update their own profile
create policy "Users can update their own profile" 
  on profiles for update 
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users can only insert their own profile (handled by trigger, but adding for completeness)
create policy "Users can insert their own profile" 
  on profiles for insert 
  with check (auth.uid() = id);

-- Create indexes for performance
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_profiles_created_at on profiles(created_at);

-- Function to handle profile creation when a new user signs up
create or replace function handle_new_user_profile()
returns trigger as $$
begin
  -- Create a profile for the new user
  -- Generate a unique username based on email or metadata
  insert into profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.user_metadata->>'username',
      new.user_metadata->>'full_name',
      split_part(new.email, '@', 1)
    ),
    new.user_metadata->>'avatar_url'
  );
  
  return new;
exception
  when unique_violation then
    -- If username is already taken, append user id suffix
    insert into profiles (id, username, avatar_url)
    values (
      new.id,
      coalesce(
        new.user_metadata->>'username',
        new.user_metadata->>'full_name',
        split_part(new.email, '@', 1)
      ) || '_' || substring(new.id::text from 1 for 8),
      new.user_metadata->>'avatar_url'
    );
    
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile on user signup
drop trigger if exists trigger_create_user_profile on auth.users;
create trigger trigger_create_user_profile
  after insert on auth.users
  for each row
  execute function handle_new_user_profile();

-- Function to handle updated_at timestamp
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to update timestamp on profile changes
drop trigger if exists trigger_profiles_updated_at on profiles;
create trigger trigger_profiles_updated_at
  before update on profiles
  for each row
  execute function handle_updated_at();