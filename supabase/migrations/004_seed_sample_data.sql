-- Migration 004: Seed Sample Data
-- This migration populates the database with sample comic series, issues, and market data
-- Based on the fixtures.json data structure

-- Insert sample comic series
insert into comic_series (id, name, publisher, start_year, description, aliases) values
  ('12345678-1234-1234-1234-123456789001', 'The Amazing Spider-Man', 'Marvel Comics', 1963, 'The flagship Spider-Man comic series', '["asm", "amazing spider-man", "amazing spiderman"]'::jsonb),
  ('12345678-1234-1234-1234-123456789002', 'Batman', 'DC Comics', 1940, 'The original Batman comic series', '["batman", "the batman"]'::jsonb),
  ('12345678-1234-1234-1234-123456789003', 'The X-Men', 'Marvel Comics', 1963, 'The original X-Men comic series', '["x-men", "xmen", "uncanny x-men"]'::jsonb)
on conflict (id) do nothing;

-- Insert sample issues
insert into issue (id, series_id, issue_number, cover_date, key_notes) values
  ('87654321-4321-4321-4321-876543210001', '12345678-1234-1234-1234-123456789001', '300', '1988-05-01', 'First appearance of Venom (symbiote costume)'),
  ('87654321-4321-4321-4321-876543210002', '12345678-1234-1234-1234-123456789002', '181', '1966-06-01', 'First appearance of Poison Ivy'),
  ('87654321-4321-4321-4321-876543210003', '12345678-1234-1234-1234-123456789003', '101', '1976-10-01', 'First appearance of Phoenix'),
  ('87654321-4321-4321-4321-876543210004', '12345678-1234-1234-1234-123456789001', '129', '1974-02-01', 'First appearance of The Punisher'),
  ('87654321-4321-4321-4321-876543210005', '12345678-1234-1234-1234-123456789002', '357', '1983-03-01', 'First appearance of Jason Todd as Robin'),
  ('87654321-4321-4321-4321-876543210006', '12345678-1234-1234-1234-123456789003', '1', '1963-09-01', 'First appearance of the X-Men and Magneto')
on conflict (series_id, issue_number) do nothing;

-- Insert sample market values
insert into market_value (
  id, series_id, issue_id, grade_id, window_days, sample_count, 
  median_gbp, mean_gbp, stddev_gbp, min_gbp, max_gbp, last_updated
) values
  -- ASM #300 CGC 9.4
  ('11111111-1111-1111-1111-111111111101', 
   '12345678-1234-1234-1234-123456789001', 
   '87654321-4321-4321-4321-876543210001', 
   '55555555-5555-5555-5555-555555555555', -- CGC 9.4 NM
   30, 12, 285.50, 290.75, 25.80, 250.00, 340.00, 
   '2025-08-22T14:30:00Z'),

  -- Batman #181 CGC 8.5
  ('11111111-1111-1111-1111-111111111102', 
   '12345678-1234-1234-1234-123456789002', 
   '87654321-4321-4321-4321-876543210002', 
   '88888888-8888-8888-8888-888888888888', -- CGC 8.5 VF+
   30, 8, 425.00, 438.25, 42.15, 380.00, 495.00, 
   '2025-08-22T14:30:00Z'),

  -- X-Men #101 CGC 9.8
  ('11111111-1111-1111-1111-111111111103', 
   '12345678-1234-1234-1234-123456789003', 
   '87654321-4321-4321-4321-876543210003', 
   '33333333-3333-3333-3333-333333333333', -- CGC 9.8 NM/MT
   30, 5, 180.00, 185.60, 18.90, 165.00, 210.00, 
   '2025-08-22T14:30:00Z'),

  -- ASM #129 Raw NM
  ('11111111-1111-1111-1111-111111111104', 
   '12345678-1234-1234-1234-123456789001', 
   '87654321-4321-4321-4321-876543210004', 
   '20000000-0000-0000-0000-000000000001', -- Raw NM
   30, 15, 95.00, 102.50, 12.75, 75.00, 125.00, 
   '2025-08-22T14:30:00Z'),

  -- X-Men #1 Raw GD (for high-value example)
  ('11111111-1111-1111-1111-111111111105', 
   '12345678-1234-1234-1234-123456789003', 
   '87654321-4321-4321-4321-876543210006', 
   '20000000-0000-0000-0000-000000000005', -- Raw GD
   30, 6, 2700.00, 2800.00, 150.00, 2500.00, 3100.00, 
   '2025-08-22T14:30:00Z'),

  -- Batman #181 CGC 8.5 (additional market value for different window)
  ('11111111-1111-1111-1111-111111111106', 
   '12345678-1234-1234-1234-123456789002', 
   '87654321-4321-4321-4321-876543210002', 
   '88888888-8888-8888-8888-888888888888', -- CGC 8.5 VF+
   90, 22, 900.00, 950.00, 75.00, 800.00, 1100.00, 
   '2025-08-22T14:30:00Z')
on conflict (series_id, issue_id, grade_id, window_days) do nothing;

-- Insert sample raw listings (simulating eBay data)
insert into listing_raw (
  id, source, external_id, title, description, price_gbp, shipping_gbp, 
  currency, listing_url, status, ends_at
) values
  ('22222222-2222-2222-2222-222222222201', 
   'ebay', 'ebay-uk-123456789', 
   'Amazing Spider-Man #300 CGC 9.4 NM First Venom Appearance',
   'Key Marvel Comics issue featuring first appearance of Venom symbiote costume. CGC certified 9.4 Near Mint condition.',
   220.00, 5.00, 'GBP', 
   'https://ebay.co.uk/itm/123456789', 'active',
   '2025-09-05T18:30:00Z'),

  ('22222222-2222-2222-2222-222222222202', 
   'ebay', 'ebay-uk-987654321', 
   'Batman #181 CGC 8.5 VF+ First Poison Ivy Silver Age',
   'Classic DC Comics Batman issue featuring first appearance of Poison Ivy. CGC certified 8.5 Very Fine Plus.',
   315.00, 8.50, 'GBP', 
   'https://ebay.co.uk/itm/987654321', 'active',
   '2025-09-03T21:45:00Z'),

  ('22222222-2222-2222-2222-222222222203', 
   'ebay', 'ebay-uk-456789123', 
   'X-Men #1 Raw Good Condition First Appearance Marvel 1963',
   'Original X-Men #1 from 1963. First appearance of X-Men and Magneto. Raw/ungraded, Good condition.',
   2250.00, 15.00, 'GBP', 
   'https://ebay.co.uk/itm/456789123', 'active',
   '2025-09-07T20:15:00Z')
on conflict (source, external_id) do nothing;

-- Insert sample normalized listings
insert into listing_normalised (
  id, raw_listing_id, series_id, issue_id, grade_id, 
  confidence_score, parsed_title, parsed_issue_number, parsed_grade, total_price_gbp
) values
  ('33333333-3333-3333-3333-333333333301', 
   '22222222-2222-2222-2222-222222222201',
   '12345678-1234-1234-1234-123456789001',
   '87654321-4321-4321-4321-876543210001',
   '55555555-5555-5555-5555-555555555555', -- CGC 9.4 NM
   0.95, 'Amazing Spider-Man #300', '300', 'CGC 9.4', 225.00),

  ('33333333-3333-3333-3333-333333333302', 
   '22222222-2222-2222-2222-222222222202',
   '12345678-1234-1234-1234-123456789002',
   '87654321-4321-4321-4321-876543210002',
   '88888888-8888-8888-8888-888888888888', -- CGC 8.5 VF+
   0.92, 'Batman #181', '181', 'CGC 8.5', 323.50),

  ('33333333-3333-3333-3333-333333333303', 
   '22222222-2222-2222-2222-222222222203',
   '12345678-1234-1234-1234-123456789003',
   '87654321-4321-4321-4321-876543210006',
   '20000000-0000-0000-0000-000000000005', -- Raw GD
   0.88, 'X-Men #1', '1', 'Raw Good', 2265.00)
on conflict do nothing;

-- Insert sample deals
insert into deal (
  id, listing_id, series_id, issue_id, grade_id,
  price_gbp, shipping_gbp, total_price_gbp, market_value_gbp, deal_score,
  expires_at
) values
  ('44444444-4444-4444-4444-444444444401',
   '33333333-3333-3333-3333-333333333301',
   '12345678-1234-1234-1234-123456789001',
   '87654321-4321-4321-4321-876543210001',
   '55555555-5555-5555-5555-555555555555', -- CGC 9.4 NM
   220.00, 5.00, 225.00, 290.75, 23.0,
   '2025-09-05T18:30:00Z'),

  ('44444444-4444-4444-4444-444444444402',
   '33333333-3333-3333-3333-333333333302',
   '12345678-1234-1234-1234-123456789002',
   '87654321-4321-4321-4321-876543210002',
   '88888888-8888-8888-8888-888888888888', -- CGC 8.5 VF+
   315.00, 8.50, 323.50, 438.25, 26.2,
   '2025-09-03T21:45:00Z'),

  ('44444444-4444-4444-4444-444444444403',
   '33333333-3333-3333-3333-333333333303',
   '12345678-1234-1234-1234-123456789003',
   '87654321-4321-4321-4321-876543210006',
   '20000000-0000-0000-0000-000000000005', -- Raw GD
   2250.00, 15.00, 2265.00, 2800.00, 19.1,
   '2025-09-07T20:15:00Z')
on conflict do nothing;