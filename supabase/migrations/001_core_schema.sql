-- Migration 001: Core Schema with Complete Table Structure
-- This migration creates the complete database schema for ComicScout UK

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create ComicSeries table
create table if not exists comic_series (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  publisher text,
  start_year integer,
  description text,
  aliases jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Issue table
create table if not exists issue (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid references comic_series(id) on delete cascade,
  issue_number text not null,
  cover_date date,
  key_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(series_id, issue_number)
);

-- Create Grade table
create table if not exists grade (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  description text,
  scale text not null default 'CGC',
  numeric_value decimal(3,1),
  cert_body text,
  created_at timestamp with time zone default now(),
  unique(scale, label)
);

-- Create MarketValue table
create table if not exists market_value (
  id uuid primary key default uuid_generate_v4(),
  series_id uuid references comic_series(id) on delete cascade,
  issue_id uuid references issue(id) on delete cascade,
  grade_id uuid references grade(id) on delete cascade,
  window_days integer not null default 30,
  sample_count integer not null default 0,
  median_gbp numeric(10,2),
  mean_gbp numeric(10,2),
  stddev_gbp numeric(10,2),
  min_gbp numeric(10,2),
  max_gbp numeric(10,2),
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(series_id, issue_id, grade_id, window_days)
);

-- Create raw listings table for data ingestion
create table if not exists listing_raw (
  id uuid primary key default uuid_generate_v4(),
  source text not null, -- 'ebay', 'gocollect', etc.
  external_id text not null,
  title text not null,
  description text,
  price_gbp numeric(10,2),
  shipping_gbp numeric(10,2) default 0,
  currency text default 'GBP',
  listing_url text,
  image_urls jsonb default '[]'::jsonb,
  seller_info jsonb,
  listing_data jsonb, -- raw API response
  status text default 'active',
  ends_at timestamp with time zone,
  fetched_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(source, external_id)
);

-- Create normalized listings table
create table if not exists listing_normalised (
  id uuid primary key default uuid_generate_v4(),
  raw_listing_id uuid references listing_raw(id) on delete cascade,
  series_id uuid references comic_series(id),
  issue_id uuid references issue(id),
  grade_id uuid references grade(id),
  confidence_score numeric(3,2) default 0.0, -- parsing confidence 0-1
  parsed_title text,
  parsed_issue_number text,
  parsed_grade text,
  total_price_gbp numeric(10,2),
  normalization_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Deal table to store live listings and scores
create table if not exists deal (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listing_normalised(id) on delete cascade,
  series_id uuid references comic_series(id) on delete cascade,
  issue_id uuid references issue(id) on delete cascade,
  grade_id uuid references grade(id) on delete cascade,
  price_gbp numeric(10,2) not null,
  shipping_gbp numeric(10,2) default 0,
  total_price_gbp numeric(10,2) not null,
  market_value_gbp numeric(10,2) not null,
  deal_score numeric(5,2) not null,
  listing_data jsonb,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create Users table (integrates with Supabase Auth)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create AlertRule table
create table if not exists alert_rule (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  series_id uuid references comic_series(id) on delete cascade,
  issue_id uuid references issue(id) on delete set null,
  grade_id uuid references grade(id) on delete set null,
  min_deal_score numeric(5,2) not null,
  max_price_gbp numeric(10,2),
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create user_alerts table for notification history
create table if not exists user_alert (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  alert_rule_id uuid references alert_rule(id) on delete cascade,
  deal_id uuid references deal(id) on delete set null,
  sent_at timestamp with time zone default now(),
  delivery_status text default 'sent', -- 'sent', 'failed', 'bounced'
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index if not exists idx_comic_series_name on comic_series(name);
create index if not exists idx_comic_series_publisher on comic_series(publisher);
create index if not exists idx_issue_series_id on issue(series_id);
create index if not exists idx_issue_series_number on issue(series_id, issue_number);
create index if not exists idx_market_value_series_issue_grade on market_value(series_id, issue_id, grade_id);
create index if not exists idx_market_value_last_updated on market_value(last_updated);
create index if not exists idx_listing_raw_source_external on listing_raw(source, external_id);
create index if not exists idx_listing_raw_status on listing_raw(status);
create index if not exists idx_listing_normalised_series_issue_grade on listing_normalised(series_id, issue_id, grade_id);
create index if not exists idx_deal_score on deal(deal_score desc);
create index if not exists idx_deal_series_issue on deal(series_id, issue_id);
create index if not exists idx_deal_created_at on deal(created_at desc);
create index if not exists idx_alert_rule_user_active on alert_rule(user_id, is_active);

-- Add updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Add updated_at triggers
create trigger update_comic_series_updated_at before update on comic_series
    for each row execute function update_updated_at_column();
create trigger update_issue_updated_at before update on issue
    for each row execute function update_updated_at_column();
create trigger update_listing_normalised_updated_at before update on listing_normalised
    for each row execute function update_updated_at_column();
create trigger update_deal_updated_at before update on deal
    for each row execute function update_updated_at_column();
create trigger update_users_updated_at before update on users
    for each row execute function update_updated_at_column();
create trigger update_alert_rule_updated_at before update on alert_rule
    for each row execute function update_updated_at_column();