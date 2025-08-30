-- Migration 005: Utility Functions and Views
-- This migration creates helpful functions and views for the ComicScout application

-- Function to calculate deal score
create or replace function calculate_deal_score(
  listing_price numeric,
  market_value numeric
) returns numeric as $$
begin
  if market_value = 0 or market_value is null then
    return 0;
  end if;
  
  return round(((market_value - listing_price) / market_value * 100), 2);
end;
$$ language plpgsql immutable;

-- Function to get top deals with filters
create or replace function get_top_deals(
  min_score numeric default 10,
  series_filter text default null,
  issue_filter text default null,
  grade_filter text default null,
  result_limit integer default 50
) returns table (
  deal_id uuid,
  series_name text,
  publisher text,
  issue_number text,
  grade_label text,
  price_gbp numeric,
  shipping_gbp numeric,
  total_price_gbp numeric,
  market_value_gbp numeric,
  deal_score numeric,
  key_notes text,
  listing_url text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone
) as $$
begin
  return query
  select 
    d.id as deal_id,
    cs.name as series_name,
    cs.publisher,
    i.issue_number,
    g.label as grade_label,
    d.price_gbp,
    d.shipping_gbp,
    d.total_price_gbp,
    d.market_value_gbp,
    d.deal_score,
    i.key_notes,
    lr.listing_url,
    d.expires_at,
    d.created_at
  from deal d
  join comic_series cs on d.series_id = cs.id
  join issue i on d.issue_id = i.id
  join grade g on d.grade_id = g.id
  join listing_normalised ln on d.listing_id = ln.id
  join listing_raw lr on ln.raw_listing_id = lr.id
  where 
    d.deal_score >= min_score
    and (series_filter is null or cs.name ilike '%' || series_filter || '%')
    and (issue_filter is null or i.issue_number = issue_filter)
    and (grade_filter is null or g.label ilike '%' || grade_filter || '%')
    and lr.status = 'active'
    and (d.expires_at is null or d.expires_at > now())
  order by d.deal_score desc, d.created_at desc
  limit result_limit;
end;
$$ language plpgsql;

-- Function to search series by name or alias
create or replace function search_series(search_term text)
returns table (
  series_id uuid,
  name text,
  publisher text,
  start_year integer,
  match_type text
) as $$
begin
  return query
  select 
    cs.id as series_id,
    cs.name,
    cs.publisher,
    cs.start_year,
    case 
      when cs.name ilike '%' || search_term || '%' then 'name'
      when cs.aliases ? search_term then 'alias'
      else 'partial'
    end as match_type
  from comic_series cs
  where 
    cs.name ilike '%' || search_term || '%'
    or cs.aliases ? search_term
    or exists (
      select 1 
      from jsonb_array_elements_text(cs.aliases) as alias
      where alias ilike '%' || search_term || '%'
    )
  order by 
    case 
      when cs.name ilike search_term then 1
      when cs.name ilike search_term || '%' then 2
      when cs.aliases ? search_term then 3
      else 4
    end,
    cs.name;
end;
$$ language plpgsql;

-- View for comprehensive deal information
create or replace view deal_details as
select 
  d.id as deal_id,
  cs.name as series_name,
  cs.publisher,
  cs.start_year,
  i.issue_number,
  i.cover_date,
  i.key_notes,
  g.label as grade_label,
  g.scale as grade_scale,
  g.numeric_value as grade_numeric,
  d.price_gbp,
  d.shipping_gbp,
  d.total_price_gbp,
  d.market_value_gbp,
  d.deal_score,
  lr.title as listing_title,
  lr.listing_url,
  lr.source as listing_source,
  lr.external_id as listing_external_id,
  ln.confidence_score as parsing_confidence,
  d.expires_at,
  d.created_at as deal_created_at,
  d.updated_at as deal_updated_at
from deal d
join comic_series cs on d.series_id = cs.id
join issue i on d.issue_id = i.id  
join grade g on d.grade_id = g.id
left join listing_normalised ln on d.listing_id = ln.id
left join listing_raw lr on ln.raw_listing_id = lr.id;

-- View for market value summary
create or replace view market_value_summary as
select 
  mv.id as market_value_id,
  cs.name as series_name,
  cs.publisher,
  i.issue_number,
  i.key_notes,
  g.label as grade_label,
  g.scale as grade_scale,
  mv.window_days,
  mv.sample_count,
  mv.median_gbp,
  mv.mean_gbp,
  mv.stddev_gbp,
  mv.min_gbp,
  mv.max_gbp,
  mv.last_updated,
  case 
    when mv.sample_count >= 10 then 'high'
    when mv.sample_count >= 5 then 'medium'
    else 'low'
  end as confidence_level
from market_value mv
join comic_series cs on mv.series_id = cs.id
join issue i on mv.issue_id = i.id
join grade g on mv.grade_id = g.id;

-- Function to update deal scores based on current market values
create or replace function refresh_deal_scores()
returns void as $$
begin
  update deal 
  set 
    deal_score = calculate_deal_score(total_price_gbp, market_value_gbp),
    updated_at = now()
  where market_value_gbp > 0;
end;
$$ language plpgsql;

-- Function to clean up expired deals
create or replace function cleanup_expired_deals()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from deal 
  where expires_at is not null 
    and expires_at < now() - interval '1 day';
    
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql;

-- Function to get alert-worthy deals for a user
create or replace function get_user_alert_deals(user_uuid uuid)
returns table (
  deal_id uuid,
  alert_rule_id uuid,
  series_name text,
  issue_number text,
  grade_label text,
  deal_score numeric,
  total_price_gbp numeric,
  market_value_gbp numeric,
  min_required_score numeric,
  max_allowed_price numeric
) as $$
begin
  return query
  select 
    d.id as deal_id,
    ar.id as alert_rule_id,
    cs.name as series_name,
    i.issue_number,
    g.label as grade_label,
    d.deal_score,
    d.total_price_gbp,
    d.market_value_gbp,
    ar.min_deal_score as min_required_score,
    ar.max_price_gbp as max_allowed_price
  from alert_rule ar
  join deal d on d.series_id = ar.series_id
  join comic_series cs on d.series_id = cs.id
  join issue i on d.issue_id = i.id
  join grade g on d.grade_id = g.id
  where 
    ar.user_id = user_uuid
    and ar.is_active = true
    and d.deal_score >= ar.min_deal_score
    and (ar.max_price_gbp is null or d.total_price_gbp <= ar.max_price_gbp)
    and (ar.issue_id is null or d.issue_id = ar.issue_id)
    and (ar.grade_id is null or d.grade_id = ar.grade_id)
    and (d.expires_at is null or d.expires_at > now())
    -- Don't send duplicate alerts
    and not exists (
      select 1 from user_alert ua 
      where ua.user_id = user_uuid 
        and ua.deal_id = d.id 
        and ua.sent_at > now() - interval '24 hours'
    );
end;
$$ language plpgsql security definer;