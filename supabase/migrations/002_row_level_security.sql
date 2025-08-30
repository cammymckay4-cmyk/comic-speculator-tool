-- Migration 002: Row Level Security Policies
-- This migration implements comprehensive RLS policies for all tables

-- Enable Row Level Security on all user-related tables
alter table users enable row level security;
alter table alert_rule enable row level security;
alter table user_alert enable row level security;
alter table deal enable row level security;

-- Enable RLS on core data tables for potential future multi-tenancy
alter table comic_series enable row level security;
alter table issue enable row level security;
alter table grade enable row level security;
alter table market_value enable row level security;
alter table listing_raw enable row level security;
alter table listing_normalised enable row level security;

-- Users table policies
create policy "Users can view their own profile"
  on users for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on users for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on users for insert with check (auth.uid() = id);

-- Alert rule policies
create policy "Users can view their own alert rules"
  on alert_rule for select using (auth.uid() = user_id);

create policy "Users can insert their own alert rules"
  on alert_rule for insert with check (auth.uid() = user_id);

create policy "Users can update their own alert rules"
  on alert_rule for update using (auth.uid() = user_id);

create policy "Users can delete their own alert rules"
  on alert_rule for delete using (auth.uid() = user_id);

-- User alert policies
create policy "Users can view their own alerts"
  on user_alert for select using (auth.uid() = user_id);

create policy "Service can insert user alerts"
  on user_alert for insert with check (true); -- Allow service to send alerts

-- Public read access to core data tables
create policy "Allow public read access to comic series"
  on comic_series for select using (true);

create policy "Allow public read access to issues"
  on issue for select using (true);

create policy "Allow public read access to grades"
  on grade for select using (true);

create policy "Allow public read access to market values"
  on market_value for select using (true);

create policy "Allow public read access to deals"
  on deal for select using (true);

-- Restrict write access to core data tables to authenticated users with service role
create policy "Only service can modify comic series"
  on comic_series for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Only service can modify issues"
  on issue for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Only service can modify grades"
  on grade for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Only service can modify market values"
  on market_value for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Only service can modify deals"
  on deal for all using (auth.jwt() ->> 'role' = 'service_role');

-- Listing tables - restrict to service role only
create policy "Only service can access raw listings"
  on listing_raw for all using (auth.jwt() ->> 'role' = 'service_role');

create policy "Only service can access normalised listings"
  on listing_normalised for all using (auth.jwt() ->> 'role' = 'service_role');

-- Create a function to handle user creation from auth.users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for automatic user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();