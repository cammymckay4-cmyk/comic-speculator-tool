-- SQL schema for ComicScout Supabase

-- Create ComicSeries table
create table if not exists comic_series (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  publisher text,
  created_at timestamp with time zone default now()
);

-- Create Issue table
create table if not exists issue (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid references comic_series(id) on delete cascade,
  issue_number text not null,
  release_date date,
  created_at timestamp with time zone default now()
);

-- Create Grade table
create table if not exists grade (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  description text
);

-- Create MarketValue table
create table if not exists market_value (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid references comic_series(id) on delete cascade,
  issue_number text not null,
  grade_id uuid references grade(id) on delete cascade,
  sample_count integer,
  median numeric,
  mean numeric,
  stddev numeric,
  min numeric,
  max numeric,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create Deal table to store live listings and scores
create table if not exists deal (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid references comic_series(id) on delete cascade,
  issue_number text not null,
  grade_id uuid references grade(id) on delete cascade,
  price numeric not null,
  shipping numeric,
  deal_score numeric,
  data jsonb,
  created_at timestamp with time zone default now()
);

-- Create Users table (app users)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default now()
);

-- Create AlertRule table
create table if not exists alert_rule (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  series_id uuid references comic_series(id) on delete cascade,
  issue_number text,
  grade_id uuid references grade(id) on delete cascade,
  min_deal_score numeric,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) on key tables
alter table users enable row level security;
alter table alert_rule enable row level security;
alter table deal enable row level security;

-- Policies: users can see and manage their own alert rules
create policy "Users can view their own alerts"
  on alert_rule for select using (auth.uid() = user_id);

create policy "Users can insert their own alerts"
  on alert_rule for insert with check (auth.uid() = user_id);

create policy "Users can delete their own alerts"
  on alert_rule for delete using (auth.uid() = user_id);

-- Example: open read access to deals (anyone can read public deal data)
create policy "Allow read access to deals"
  on deal for select using (true);
