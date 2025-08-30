-- =====================================================
-- ComicScoutUK Database Migration: Sample Data
-- File: 004_seed_sample_data.sql
-- Description: Realistic sample data for testing and development
-- =====================================================

-- =====================================================
-- POPULAR COMIC SERIES
-- =====================================================

INSERT INTO comic_series (id, name, aliases, publisher, publication_start_date, description, genre) VALUES 
-- Marvel Comics
('10000000-1000-4000-a000-000000000001', 'The Amazing Spider-Man', 
 ARRAY['Amazing Spider-Man', 'Spider-Man', 'ASM'], 'Marvel Comics', '1963-03-01',
 'The flagship Spider-Man series featuring Peter Parker', ARRAY['superhero', 'action']),
 
('10000000-1000-4000-a000-000000000002', 'X-Men', 
 ARRAY['The X-Men', 'Uncanny X-Men'], 'Marvel Comics', '1963-09-01',
 'Mutant superhero team fighting for peaceful coexistence', ARRAY['superhero', 'sci-fi']),
 
('10000000-1000-4000-a000-000000000003', 'Fantastic Four', 
 ARRAY['The Fantastic Four', 'FF'], 'Marvel Comics', '1961-11-01',
 'Marvel''s First Family of superheroes', ARRAY['superhero', 'sci-fi']),
 
('10000000-1000-4000-a000-000000000004', 'The Avengers', 
 ARRAY['Avengers'], 'Marvel Comics', '1963-09-01',
 'Earth''s Mightiest Heroes', ARRAY['superhero', 'team']),

-- DC Comics 
('20000000-1000-4000-a000-000000000001', 'Batman', 
 ARRAY['The Batman'], 'DC Comics', '1940-04-01',
 'The Dark Knight of Gotham City', ARRAY['superhero', 'detective']),
 
('20000000-1000-4000-a000-000000000002', 'Superman', 
 ARRAY['Action Comics'], 'DC Comics', '1938-06-01',
 'The Man of Steel, Earth''s greatest champion', ARRAY['superhero', 'action']),
 
('20000000-1000-4000-a000-000000000003', 'Wonder Woman', 
 ARRAY['The Wonder Woman'], 'DC Comics', '1942-01-01',
 'Amazon Princess and founding member of the Justice League', ARRAY['superhero', 'mythology']),

-- Independent Comics
('30000000-1000-4000-a000-000000000001', 'The Walking Dead', 
 ARRAY['Walking Dead'], 'Image Comics', '2003-10-01',
 'Post-apocalyptic zombie survival horror', ARRAY['horror', 'drama']),
 
('30000000-1000-4000-a000-000000000002', 'Saga', 
 ARRAY[], 'Image Comics', '2012-03-01',
 'Space opera about star-crossed lovers from warring worlds', ARRAY['sci-fi', 'fantasy', 'romance']);

-- =====================================================
-- KEY COMIC ISSUES
-- =====================================================

INSERT INTO comic_issues (id, series_id, issue_number, variant, release_date, key_issue, key_issue_notes, synopsis) VALUES 
-- Amazing Spider-Man key issues
('11000000-2000-4000-a000-000000000001', '10000000-1000-4000-a000-000000000001', '1', null, '1963-03-01', true, 
 'First appearance of Spider-Man in his own title, First appearance of J. Jonah Jameson and the Chameleon',
 'Spider-Man faces the Chameleon in his first solo adventure'),

('11000000-2000-4000-a000-000000000002', '10000000-1000-4000-a000-000000000001', '14', null, '1964-07-01', true,
 'First appearance of the Green Goblin',
 'The Green Goblin makes his menacing debut'),

('11000000-2000-4000-a000-000000000003', '10000000-1000-4000-a000-000000000001', '50', null, '1967-07-01', true,
 'First appearance of the Kingpin',
 'Wilson Fisk, the Kingpin of crime, enters Spider-Man''s world'),

('11000000-2000-4000-a000-000000000004', '10000000-1000-4000-a000-000000000001', '121', null, '1973-06-01', true,
 'Death of Gwen Stacy',
 'The tragic death of Gwen Stacy at the hands of the Green Goblin'),

('11000000-2000-4000-a000-000000000005', '10000000-1000-4000-a000-000000000001', '129', null, '1974-02-01', true,
 'First appearance of the Punisher',
 'Frank Castle makes his first appearance as the Punisher'),

-- X-Men key issues  
('12000000-2000-4000-a000-000000000001', '10000000-1000-4000-a000-000000000002', '1', null, '1963-09-01', true,
 'First appearance of the X-Men, Professor X, Cyclops, Marvel Girl, Beast, Angel, Iceman, and Magneto',
 'The birth of the X-Men'),

('12000000-2000-4000-a000-000000000002', '10000000-1000-4000-a000-000000000002', '94', null, '1975-08-01', true,
 'New X-Men begin, features new team lineup',
 'The all-new, all-different X-Men are introduced'),

('12000000-2000-4000-a000-000000000003', '10000000-1000-4000-a000-000000000002', '101', null, '1976-10-01', true,
 'First appearance of Phoenix',
 'Jean Grey becomes Phoenix'),

-- Fantastic Four key issues
('13000000-2000-4000-a000-000000000001', '10000000-1000-4000-a000-000000000003', '1', null, '1961-11-01', true,
 'First appearance of Fantastic Four',
 'The origin of Marvel''s First Family'),

('13000000-2000-4000-a000-000000000002', '10000000-1000-4000-a000-000000000003', '5', null, '1962-07-01', true,
 'First appearance of Doctor Doom',
 'The first appearance of Victor Von Doom'),

('13000000-2000-4000-a000-000000000003', '10000000-1000-4000-a000-000000000003', '48', null, '1966-03-01', true,
 'First appearance of Silver Surfer and Galactus',
 'The coming of Galactus'),

-- Batman key issues
('21000000-2000-4000-a000-000000000001', '20000000-1000-4000-a000-000000000001', '1', null, '1940-04-01', true,
 'First appearance of Batman and the Joker',
 'The Dark Knight''s debut'),

('21000000-2000-4000-a000-000000000002', '20000000-1000-4000-a000-000000000001', '181', null, '1966-08-01', true,
 'First appearance of Poison Ivy',
 'Pamela Isley makes her villainous debut'),

-- Walking Dead key issues
('31000000-2000-4000-a000-000000000001', '30000000-1000-4000-a000-000000000001', '1', null, '2003-10-01', true,
 'First appearance of Rick Grimes and the beginning of The Walking Dead',
 'The zombie apocalypse begins'),

('31000000-2000-4000-a000-000000000002', '30000000-1000-4000-a000-000000000001', '19', null, '2005-04-01', true,
 'First appearance of Michonne',
 'The katana-wielding survivor joins the story');

-- =====================================================
-- SAMPLE MARKET VALUES
-- =====================================================

INSERT INTO market_values (id, series_id, issue_id, grade_id, sample_count, median_price, mean_price, stddev_price, min_price, max_price, price_trend_30d, price_trend_90d) VALUES 
-- Amazing Spider-Man #1 values across different grades
('41000000-3000-4000-a000-000000000001', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000003', 45, 25000.00, 26500.00, 3200.00, 18000.00, 35000.00, 2.5, 8.3),
('41000000-3000-4000-a000-000000000002', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000004', 32, 18000.00, 19200.00, 2100.00, 14000.00, 24000.00, 1.8, 6.2),
('41000000-3000-4000-a000-000000000003', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007', 58, 12000.00, 12800.00, 1500.00, 9000.00, 16500.00, 3.2, 12.1),
('41000000-3000-4000-a000-000000000004', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000009', 72, 6500.00, 7200.00, 850.00, 5000.00, 9500.00, 4.1, 15.8),

-- Amazing Spider-Man #14 (first Green Goblin)
('41000000-3000-4000-a000-000000000005', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000003', 28, 8500.00, 9200.00, 1200.00, 6500.00, 12000.00, 5.3, 18.7),
('41000000-3000-4000-a000-000000000006', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000007', 41, 4200.00, 4650.00, 580.00, 3200.00, 6100.00, 6.8, 22.3),

-- X-Men #1
('42000000-3000-4000-a000-000000000001', '10000000-1000-4000-a000-000000000002', '12000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000003', 23, 35000.00, 38000.00, 4500.00, 28000.00, 48000.00, 1.2, 4.8),
('42000000-3000-4000-a000-000000000002', '10000000-1000-4000-a000-000000000002', '12000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007', 38, 15000.00, 16200.00, 2100.00, 11500.00, 21000.00, 2.8, 9.4),

-- Fantastic Four #1
('43000000-3000-4000-a000-000000000001', '10000000-1000-4000-a000-000000000003', '13000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000003', 31, 45000.00, 48500.00, 6200.00, 35000.00, 62000.00, 0.8, 3.2),
('43000000-3000-4000-a000-000000000002', '10000000-1000-4000-a000-000000000003', '13000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007', 47, 22000.00, 24100.00, 3200.00, 17000.00, 31000.00, 1.5, 5.9),

-- Walking Dead #1 (more recent comic)
('44000000-3000-4000-a000-000000000001', '30000000-1000-4000-a000-000000000001', '31000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000003', 156, 3200.00, 3450.00, 420.00, 2500.00, 4500.00, 8.2, 28.5),
('44000000-3000-4000-a000-000000000002', '30000000-1000-4000-a000-000000000001', '31000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007', 203, 1200.00, 1380.00, 185.00, 900.00, 1850.00, 12.4, 35.2);

-- =====================================================
-- SAMPLE NORMALIZED LISTINGS
-- =====================================================

INSERT INTO normalized_listings (id, raw_listing_id, series_id, issue_id, grade_id, title, price, shipping_cost, currency, seller_name, seller_feedback_score, auction_type, ends_at, listing_url, is_graded, grade_notes, created_at) VALUES 
-- Current eBay-style listings
('51000000-4000-4000-a000-000000000001', null, '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007', 
 'Amazing Spider-Man #1 CGC 9.0 VFNM First Spidey in own title!', 11500.00, 25.00, 'GBP', 'comicdealer123', 9876, 'auction', NOW() + INTERVAL '2 days', 
 'https://ebay.co.uk/itm/123456789', true, 'White pages, beautiful copy', NOW() - INTERVAL '1 day'),

('51000000-4000-4000-a000-000000000002', null, '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000002', 'a0000000-0000-4000-a000-000000000009', 
 'Amazing Spider-Man #14 CGC 8.0 VF First Green Goblin!!', 4100.00, 15.00, 'GBP', 'vintage_comics_uk', 8543, 'buy_it_now', null,
 'https://ebay.co.uk/itm/234567890', true, 'Off-white pages', NOW() - INTERVAL '3 hours'),

('51000000-4000-4000-a000-000000000003', null, '10000000-1000-4000-a000-000000000002', '12000000-2000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000003', 
 'X-Men #1 (1963) Raw VF Condition First X-Men!', 14500.00, 20.00, 'GBP', 'silver_age_specialist', 9234, 'auction', NOW() + INTERVAL '1 day',
 'https://ebay.co.uk/itm/345678901', false, 'Estimated VF grade, nice copy', NOW() - INTERVAL '2 days'),

('51000000-4000-4000-a000-000000000004', null, '30000000-1000-4000-a000-000000000001', '31000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007', 
 'The Walking Dead #1 CGC 9.0 First Rick Grimes Image Comics', 1050.00, 10.00, 'GBP', 'modern_age_comics', 7891, 'best_offer', null,
 'https://ebay.co.uk/itm/456789012', true, 'White pages, great copy of this key issue', NOW() - INTERVAL '5 hours'),

('51000000-4000-4000-a000-000000000005', null, '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000005', 'a0000000-0000-4000-a000-000000000007', 
 'Amazing Spider-Man #129 CGC 9.0 First Punisher Marvel 1974', 2800.00, 18.00, 'GBP', 'key_issue_hunter', 9567, 'auction', NOW() + INTERVAL '6 hours',
 'https://ebay.co.uk/itm/567890123', true, 'White pages, first appearance of Punisher', NOW() - INTERVAL '4 days');

-- =====================================================
-- SAMPLE DEALS (High-value opportunities)
-- =====================================================

INSERT INTO deals (id, normalized_listing_id, market_value_id, deal_score, potential_profit, profit_percentage, deal_type, confidence_level, expires_at, is_active) VALUES 
-- Great deals based on market values vs listing prices
('61000000-5000-4000-a000-000000000001', '51000000-4000-4000-a000-000000000001', '41000000-3000-4000-a000-000000000003', 
 85.5, 1275.00, 10.0, 'underpriced', 'high', NOW() + INTERVAL '2 days', true),

('61000000-5000-4000-a000-000000000002', '51000000-4000-4000-a000-000000000002', '41000000-3000-4000-a000-000000000006', 
 78.2, 535.00, 11.5, 'underpriced', 'medium', null, true),

('61000000-5000-4000-a000-000000000003', '51000000-4000-4000-a000-000000000003', '42000000-3000-4000-a000-000000000002', 
 72.8, 480.00, 3.2, 'auction_ending', 'medium', NOW() + INTERVAL '1 day', true),

('61000000-5000-4000-a000-000000000004', '51000000-4000-4000-a000-000000000004', '44000000-3000-4000-a000-000000000002', 
 91.3, 320.00, 23.2, 'key_issue', 'high', null, true),

('61000000-5000-4000-a000-000000000005', '51000000-4000-4000-a000-000000000005', null, 
 68.5, 185.00, 6.2, 'auction_ending', 'medium', NOW() + INTERVAL '6 hours', true);

-- =====================================================  
-- SAMPLE USER DATA (Test User)
-- =====================================================

-- Insert sample user (this would normally be created by Supabase Auth)
INSERT INTO users (id, email, username, first_name, last_name, created_at) VALUES 
('99999999-9999-4000-a000-000000000001', 'testuser@example.com', 'comic_collector_2024', 'Test', 'User', NOW() - INTERVAL '30 days');

-- Sample user collection
INSERT INTO user_collections (id, user_id, series_id, issue_id, grade_id, acquisition_date, acquisition_price, current_value, notes, personal_rating, is_wishlist_item) VALUES 
('71000000-6000-4000-a000-000000000001', '99999999-9999-4000-a000-000000000001', '30000000-1000-4000-a000-000000000001', '31000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007',
 '2023-06-15', 850.00, 1200.00, 'Bought at local comic shop, great condition', 9, false),

('71000000-6000-4000-a000-000000000002', '99999999-9999-4000-a000-000000000001', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000003',
 '2023-08-22', 2100.00, 2800.00, 'First Punisher appearance, raw but very nice', 10, false),

-- Wishlist items
('71000000-6000-4000-a000-000000000003', '99999999-9999-4000-a000-000000000001', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000009',
 null, null, null, 'Holy Grail - saving up for this!', null, true),

('71000000-6000-4000-a000-000000000004', '99999999-9999-4000-a000-000000000001', '10000000-1000-4000-a000-000000000002', '12000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000007',
 null, null, null, 'Would love to add first X-Men to collection', null, true);

-- Sample alert rules
INSERT INTO user_alert_rules (id, user_id, series_id, issue_id, grade_id, max_price, min_deal_score, auction_types, notification_frequency) VALUES 
('81000000-7000-4000-a000-000000000001', '99999999-9999-4000-a000-000000000001', '10000000-1000-4000-a000-000000000001', '11000000-2000-4000-a000-000000000001', 'a0000000-0000-4000-a000-000000000009',
 7000.00, 75.0, ARRAY['auction', 'buy_it_now'], 'immediate'),

('81000000-7000-4000-a000-000000000002', '99999999-9999-4000-a000-000000000001', '10000000-1000-4000-a000-000000000002', '12000000-2000-4000-a000-000000000001', null,
 16000.00, 70.0, ARRAY['auction'], 'daily'),

('81000000-7000-4000-a000-000000000003', '99999999-9999-4000-a000-000000000001', '30000000-1000-4000-a000-000000000001', null, null,
 500.00, 80.0, ARRAY['auction', 'buy_it_now', 'best_offer'], 'immediate');

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Update table statistics for better query planning
ANALYZE comic_series;
ANALYZE comic_issues; 
ANALYZE grading_standards;
ANALYZE market_values;
ANALYZE normalized_listings;
ANALYZE deals;
ANALYZE user_collections;
ANALYZE user_alert_rules;