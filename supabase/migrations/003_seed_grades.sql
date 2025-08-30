-- Migration 003: Seed Grade Data
-- This migration populates the grade table with standard comic book grades

-- Insert CGC grades
insert into grade (id, label, description, scale, numeric_value, cert_body) values
  ('11111111-1111-1111-1111-111111111111', 'GM', 'Gem Mint', 'CGC', 10.0, 'CGC'),
  ('22222222-2222-2222-2222-222222222222', 'MT', 'Mint', 'CGC', 9.9, 'CGC'),
  ('33333333-3333-3333-3333-333333333333', 'NM/MT', 'Near Mint/Mint', 'CGC', 9.8, 'CGC'),
  ('44444444-4444-4444-4444-444444444444', 'NM+', 'Near Mint Plus', 'CGC', 9.6, 'CGC'),
  ('55555555-5555-5555-5555-555555555555', 'NM', 'Near Mint', 'CGC', 9.4, 'CGC'),
  ('66666666-6666-6666-6666-666666666666', 'NM-', 'Near Mint Minus', 'CGC', 9.2, 'CGC'),
  ('77777777-7777-7777-7777-777777777777', 'VF/NM', 'Very Fine/Near Mint', 'CGC', 9.0, 'CGC'),
  ('88888888-8888-8888-8888-888888888888', 'VF+', 'Very Fine Plus', 'CGC', 8.5, 'CGC'),
  ('99999999-9999-9999-9999-999999999999', 'VF', 'Very Fine', 'CGC', 8.0, 'CGC'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'VF-', 'Very Fine Minus', 'CGC', 7.5, 'CGC'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'FN/VF', 'Fine/Very Fine', 'CGC', 7.0, 'CGC'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'FN+', 'Fine Plus', 'CGC', 6.5, 'CGC'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'FN', 'Fine', 'CGC', 6.0, 'CGC'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'FN-', 'Fine Minus', 'CGC', 5.5, 'CGC'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'GD/FN', 'Good/Fine', 'CGC', 5.0, 'CGC'),
  ('00000000-0000-0000-0000-000000000001', 'GD+', 'Good Plus', 'CGC', 4.5, 'CGC'),
  ('00000000-0000-0000-0000-000000000002', 'GD', 'Good', 'CGC', 4.0, 'CGC'),
  ('00000000-0000-0000-0000-000000000003', 'GD-', 'Good Minus', 'CGC', 3.5, 'CGC'),
  ('00000000-0000-0000-0000-000000000004', 'VG/GD', 'Very Good/Good', 'CGC', 3.0, 'CGC'),
  ('00000000-0000-0000-0000-000000000005', 'VG+', 'Very Good Plus', 'CGC', 2.5, 'CGC'),
  ('00000000-0000-0000-0000-000000000006', 'VG', 'Very Good', 'CGC', 2.0, 'CGC'),
  ('00000000-0000-0000-0000-000000000007', 'VG-', 'Very Good Minus', 'CGC', 1.8, 'CGC'),
  ('00000000-0000-0000-0000-000000000008', 'GD/VG', 'Good/Very Good', 'CGC', 1.5, 'CGC'),
  ('00000000-0000-0000-0000-000000000009', 'FR/GD', 'Fair/Good', 'CGC', 1.0, 'CGC'),
  ('00000000-0000-0000-0000-00000000000a', 'FR', 'Fair', 'CGC', 0.5, 'CGC')
on conflict (scale, label) do nothing;

-- Insert CBCS grades (similar to CGC)
insert into grade (id, label, description, scale, numeric_value, cert_body) values
  ('10000000-0000-0000-0000-000000000001', 'NM/MT', 'Near Mint/Mint', 'CBCS', 9.8, 'CBCS'),
  ('10000000-0000-0000-0000-000000000002', 'NM+', 'Near Mint Plus', 'CBCS', 9.6, 'CBCS'),
  ('10000000-0000-0000-0000-000000000003', 'NM', 'Near Mint', 'CBCS', 9.4, 'CBCS'),
  ('10000000-0000-0000-0000-000000000004', 'NM-', 'Near Mint Minus', 'CBCS', 9.2, 'CBCS'),
  ('10000000-0000-0000-0000-000000000005', 'VF/NM', 'Very Fine/Near Mint', 'CBCS', 9.0, 'CBCS'),
  ('10000000-0000-0000-0000-000000000006', 'VF+', 'Very Fine Plus', 'CBCS', 8.5, 'CBCS'),
  ('10000000-0000-0000-0000-000000000007', 'VF', 'Very Fine', 'CBCS', 8.0, 'CBCS'),
  ('10000000-0000-0000-0000-000000000008', 'VF-', 'Very Fine Minus', 'CBCS', 7.5, 'CBCS'),
  ('10000000-0000-0000-0000-000000000009', 'FN/VF', 'Fine/Very Fine', 'CBCS', 7.0, 'CBCS'),
  ('10000000-0000-0000-0000-00000000000a', 'FN+', 'Fine Plus', 'CBCS', 6.5, 'CBCS'),
  ('10000000-0000-0000-0000-00000000000b', 'FN', 'Fine', 'CBCS', 6.0, 'CBCS')
on conflict (scale, label) do nothing;

-- Insert Raw/Ungraded grades
insert into grade (id, label, description, scale, numeric_value, cert_body) values
  ('20000000-0000-0000-0000-000000000001', 'NM', 'Near Mint (Raw)', 'RAW', 9.0, 'UNGRADED'),
  ('20000000-0000-0000-0000-000000000002', 'VF+', 'Very Fine Plus (Raw)', 'RAW', 8.5, 'UNGRADED'),
  ('20000000-0000-0000-0000-000000000003', 'VF', 'Very Fine (Raw)', 'RAW', 8.0, 'UNGRADED'),
  ('20000000-0000-0000-0000-000000000004', 'FN', 'Fine (Raw)', 'RAW', 6.0, 'UNGRADED'),
  ('20000000-0000-0000-0000-000000000005', 'GD', 'Good (Raw)', 'RAW', 4.0, 'UNGRADED'),
  ('20000000-0000-0000-0000-000000000006', 'PR', 'Poor (Raw)', 'RAW', 1.0, 'UNGRADED')
on conflict (scale, label) do nothing;

-- Insert PGX grades
insert into grade (id, label, description, scale, numeric_value, cert_body) values
  ('30000000-0000-0000-0000-000000000001', 'NM/MT', 'Near Mint/Mint', 'PGX', 9.8, 'PGX'),
  ('30000000-0000-0000-0000-000000000002', 'NM', 'Near Mint', 'PGX', 9.4, 'PGX'),
  ('30000000-0000-0000-0000-000000000003', 'VF/NM', 'Very Fine/Near Mint', 'PGX', 9.0, 'PGX'),
  ('30000000-0000-0000-0000-000000000004', 'VF+', 'Very Fine Plus', 'PGX', 8.5, 'PGX'),
  ('30000000-0000-0000-0000-000000000005', 'VF', 'Very Fine', 'PGX', 8.0, 'PGX')
on conflict (scale, label) do nothing;