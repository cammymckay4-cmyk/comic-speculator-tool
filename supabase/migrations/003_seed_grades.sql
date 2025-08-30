-- =====================================================
-- ComicScoutUK Database Migration: Seed Grading Standards
-- File: 003_seed_grades.sql  
-- Description: Standard comic book grading scales (CGC, CBCS, PGX, Raw)
-- =====================================================

-- =====================================================
-- CGC GRADING SCALE
-- =====================================================

INSERT INTO grading_standards (id, company, grade_value, grade_label, description, sort_order, is_active) VALUES 
-- CGC 10.0 Scale
('a0000000-0000-4000-a000-000000000001', 'CGC', 10.0, 'Gem Mint', 'Perfect comic book', 1, true),
('a0000000-0000-4000-a000-000000000002', 'CGC', 9.9, 'Mint', 'Nearly perfect comic book', 2, true),
('a0000000-0000-4000-a000-000000000003', 'CGC', 9.8, 'Near Mint/Mint', 'Nearly perfect with only minor printing defects', 3, true),
('a0000000-0000-4000-a000-000000000004', 'CGC', 9.6, 'Near Mint+', 'Nearly perfect with minor defects', 4, true),
('a0000000-0000-4000-a000-000000000005', 'CGC', 9.4, 'Near Mint', 'Nearly perfect with very minor defects', 5, true),
('a0000000-0000-4000-a000-000000000006', 'CGC', 9.2, 'Near Mint-', 'Nearly perfect with slight defects', 6, true),
('a0000000-0000-4000-a000-000000000007', 'CGC', 9.0, 'Very Fine/Near Mint', 'Nearly perfect with minor to moderate defects', 7, true),
('a0000000-0000-4000-a000-000000000008', 'CGC', 8.5, 'Very Fine+', 'Attractive comic with moderate defects', 8, true),
('a0000000-0000-4000-a000-000000000009', 'CGC', 8.0, 'Very Fine', 'Attractive comic with some defects', 9, true),
('a0000000-0000-4000-a000-00000000000a', 'CGC', 7.5, 'Very Fine-', 'Attractive comic with noticeable defects', 10, true),
('a0000000-0000-4000-a000-00000000000b', 'CGC', 7.0, 'Fine/Very Fine', 'Above average comic with some defects', 11, true),
('a0000000-0000-4000-a000-00000000000c', 'CGC', 6.5, 'Fine+', 'Above average comic with defects', 12, true),
('a0000000-0000-4000-a000-00000000000d', 'CGC', 6.0, 'Fine', 'Above average comic with obvious defects', 13, true),
('a0000000-0000-4000-a000-00000000000e', 'CGC', 5.5, 'Fine-', 'Above average comic with several defects', 14, true),
('a0000000-0000-4000-a000-00000000000f', 'CGC', 5.0, 'Very Good/Fine', 'Average comic with defects', 15, true),
('a0000000-0000-4000-a000-000000000010', 'CGC', 4.5, 'Very Good+', 'Below average comic with defects', 16, true),
('a0000000-0000-4000-a000-000000000011', 'CGC', 4.0, 'Very Good', 'Below average comic with several defects', 17, true),
('a0000000-0000-4000-a000-000000000012', 'CGC', 3.5, 'Very Good-', 'Below average comic with major defects', 18, true),
('a0000000-0000-4000-a000-000000000013', 'CGC', 3.0, 'Good/Very Good', 'Comic with major defects but complete', 19, true),
('a0000000-0000-4000-a000-000000000014', 'CGC', 2.5, 'Good+', 'Comic with major defects', 20, true),
('a0000000-0000-4000-a000-000000000015', 'CGC', 2.0, 'Good', 'Comic with major defects and wear', 21, true),
('a0000000-0000-4000-a000-000000000016', 'CGC', 1.8, 'Good-', 'Comic with major defects and significant wear', 22, true),
('a0000000-0000-4000-a000-000000000017', 'CGC', 1.5, 'Fair/Good', 'Comic with extensive defects', 23, true),
('a0000000-0000-4000-a000-000000000018', 'CGC', 1.0, 'Fair', 'Comic with extensive defects but readable', 24, true),
('a0000000-0000-4000-a000-000000000019', 'CGC', 0.5, 'Poor', 'Comic with severe damage', 25, true);

-- =====================================================
-- CBCS GRADING SCALE
-- =====================================================

INSERT INTO grading_standards (id, company, grade_value, grade_label, description, sort_order, is_active) VALUES 
-- CBCS uses same numerical scale as CGC
('b0000000-0000-4000-a000-000000000001', 'CBCS', 10.0, 'Gem Mint', 'Perfect comic book', 26, true),
('b0000000-0000-4000-a000-000000000002', 'CBCS', 9.9, 'Mint', 'Nearly perfect comic book', 27, true),
('b0000000-0000-4000-a000-000000000003', 'CBCS', 9.8, 'Near Mint/Mint', 'Nearly perfect with only minor printing defects', 28, true),
('b0000000-0000-4000-a000-000000000004', 'CBCS', 9.6, 'Near Mint+', 'Nearly perfect with minor defects', 29, true),
('b0000000-0000-4000-a000-000000000005', 'CBCS', 9.4, 'Near Mint', 'Nearly perfect with very minor defects', 30, true),
('b0000000-0000-4000-a000-000000000006', 'CBCS', 9.2, 'Near Mint-', 'Nearly perfect with slight defects', 31, true),
('b0000000-0000-4000-a000-000000000007', 'CBCS', 9.0, 'Very Fine/Near Mint', 'Nearly perfect with minor to moderate defects', 32, true),
('b0000000-0000-4000-a000-000000000008', 'CBCS', 8.5, 'Very Fine+', 'Attractive comic with moderate defects', 33, true),
('b0000000-0000-4000-a000-000000000009', 'CBCS', 8.0, 'Very Fine', 'Attractive comic with some defects', 34, true),
('b0000000-0000-4000-a000-00000000000a', 'CBCS', 7.5, 'Very Fine-', 'Attractive comic with noticeable defects', 35, true),
('b0000000-0000-4000-a000-00000000000b', 'CBCS', 7.0, 'Fine/Very Fine', 'Above average comic with some defects', 36, true),
('b0000000-0000-4000-a000-00000000000c', 'CBCS', 6.5, 'Fine+', 'Above average comic with defects', 37, true),
('b0000000-0000-4000-a000-00000000000d', 'CBCS', 6.0, 'Fine', 'Above average comic with obvious defects', 38, true),
('b0000000-0000-4000-a000-00000000000e', 'CBCS', 5.5, 'Fine-', 'Above average comic with several defects', 39, true),
('b0000000-0000-4000-a000-00000000000f', 'CBCS', 5.0, 'Very Good/Fine', 'Average comic with defects', 40, true),
('b0000000-0000-4000-a000-000000000010', 'CBCS', 4.5, 'Very Good+', 'Below average comic with defects', 41, true),
('b0000000-0000-4000-a000-000000000011', 'CBCS', 4.0, 'Very Good', 'Below average comic with several defects', 42, true),
('b0000000-0000-4000-a000-000000000012', 'CBCS', 3.5, 'Very Good-', 'Below average comic with major defects', 43, true),
('b0000000-0000-4000-a000-000000000013', 'CBCS', 3.0, 'Good/Very Good', 'Comic with major defects but complete', 44, true),
('b0000000-0000-4000-a000-000000000014', 'CBCS', 2.5, 'Good+', 'Comic with major defects', 45, true),
('b0000000-0000-4000-a000-000000000015', 'CBCS', 2.0, 'Good', 'Comic with major defects and wear', 46, true),
('b0000000-0000-4000-a000-000000000016', 'CBCS', 1.8, 'Good-', 'Comic with major defects and significant wear', 47, true),
('b0000000-0000-4000-a000-000000000017', 'CBCS', 1.5, 'Fair/Good', 'Comic with extensive defects', 48, true),
('b0000000-0000-4000-a000-000000000018', 'CBCS', 1.0, 'Fair', 'Comic with extensive defects but readable', 49, true),
('b0000000-0000-4000-a000-000000000019', 'CBCS', 0.5, 'Poor', 'Comic with severe damage', 50, true);

-- =====================================================
-- PGX GRADING SCALE  
-- =====================================================

INSERT INTO grading_standards (id, company, grade_value, grade_label, description, sort_order, is_active) VALUES 
-- PGX uses same numerical scale
('c0000000-0000-4000-a000-000000000001', 'PGX', 10.0, 'Gem Mint', 'Perfect comic book', 51, true),
('c0000000-0000-4000-a000-000000000002', 'PGX', 9.9, 'Mint', 'Nearly perfect comic book', 52, true),
('c0000000-0000-4000-a000-000000000003', 'PGX', 9.8, 'Near Mint/Mint', 'Nearly perfect with only minor printing defects', 53, true),
('c0000000-0000-4000-a000-000000000004', 'PGX', 9.6, 'Near Mint+', 'Nearly perfect with minor defects', 54, true),
('c0000000-0000-4000-a000-000000000005', 'PGX', 9.4, 'Near Mint', 'Nearly perfect with very minor defects', 55, true),
('c0000000-0000-4000-a000-000000000006', 'PGX', 9.2, 'Near Mint-', 'Nearly perfect with slight defects', 56, true),
('c0000000-0000-4000-a000-000000000007', 'PGX', 9.0, 'Very Fine/Near Mint', 'Nearly perfect with minor to moderate defects', 57, true),
('c0000000-0000-4000-a000-000000000008', 'PGX', 8.5, 'Very Fine+', 'Attractive comic with moderate defects', 58, true),
('c0000000-0000-4000-a000-000000000009', 'PGX', 8.0, 'Very Fine', 'Attractive comic with some defects', 59, true),
('c0000000-0000-4000-a000-00000000000a', 'PGX', 7.5, 'Very Fine-', 'Attractive comic with noticeable defects', 60, true),
('c0000000-0000-4000-a000-00000000000b', 'PGX', 7.0, 'Fine/Very Fine', 'Above average comic with some defects', 61, true),
('c0000000-0000-4000-a000-00000000000c', 'PGX', 6.5, 'Fine+', 'Above average comic with defects', 62, true),
('c0000000-0000-4000-a000-00000000000d', 'PGX', 6.0, 'Fine', 'Above average comic with obvious defects', 63, true),
('c0000000-0000-4000-a000-00000000000e', 'PGX', 5.5, 'Fine-', 'Above average comic with several defects', 64, true),
('c0000000-0000-4000-a000-00000000000f', 'PGX', 5.0, 'Very Good/Fine', 'Average comic with defects', 65, true),
('c0000000-0000-4000-a000-000000000010', 'PGX', 4.5, 'Very Good+', 'Below average comic with defects', 66, true),
('c0000000-0000-4000-a000-000000000011', 'PGX', 4.0, 'Very Good', 'Below average comic with several defects', 67, true),
('c0000000-0000-4000-a000-000000000012', 'PGX', 3.5, 'Very Good-', 'Below average comic with major defects', 68, true),
('c0000000-0000-4000-a000-000000000013', 'PGX', 3.0, 'Good/Very Good', 'Comic with major defects but complete', 69, true),
('c0000000-0000-4000-a000-000000000014', 'PGX', 2.5, 'Good+', 'Comic with major defects', 70, true),
('c0000000-0000-4000-a000-000000000015', 'PGX', 2.0, 'Good', 'Comic with major defects and wear', 71, true),
('c0000000-0000-4000-a000-000000000016', 'PGX', 1.8, 'Good-', 'Comic with major defects and significant wear', 72, true),
('c0000000-0000-4000-a000-000000000017', 'PGX', 1.5, 'Fair/Good', 'Comic with extensive defects', 73, true),
('c0000000-0000-4000-a000-000000000018', 'PGX', 1.0, 'Fair', 'Comic with extensive defects but readable', 74, true),
('c0000000-0000-4000-a000-000000000019', 'PGX', 0.5, 'Poor', 'Comic with severe damage', 75, true);

-- =====================================================
-- RAW/UNGRADED CATEGORIES
-- =====================================================

INSERT INTO grading_standards (id, company, grade_value, grade_label, description, sort_order, is_active) VALUES 
-- Raw grades for unslabbed comics
('d0000000-0000-4000-a000-000000000001', 'Raw', 10.0, 'Raw Gem Mint', 'Ungraded comic in perfect condition', 76, true),
('d0000000-0000-4000-a000-000000000002', 'Raw', 9.0, 'Raw Near Mint', 'Ungraded comic in near mint condition', 77, true),
('d0000000-0000-4000-a000-000000000003', 'Raw', 8.0, 'Raw Very Fine', 'Ungraded comic in very fine condition', 78, true),
('d0000000-0000-4000-a000-000000000004', 'Raw', 7.0, 'Raw Fine', 'Ungraded comic in fine condition', 79, true),
('d0000000-0000-4000-a000-000000000005', 'Raw', 6.0, 'Raw Good+', 'Ungraded comic in good+ condition', 80, true),
('d0000000-0000-4000-a000-000000000006', 'Raw', 5.0, 'Raw Good', 'Ungraded comic in good condition', 81, true),
('d0000000-0000-4000-a000-000000000007', 'Raw', 4.0, 'Raw Fair', 'Ungraded comic in fair condition', 82, true),
('d0000000-0000-4000-a000-000000000008', 'Raw', 0.0, 'Ungraded', 'Condition not specified', 83, true);

-- =====================================================
-- SPECIALTY GRADES
-- =====================================================

INSERT INTO grading_standards (id, company, grade_value, grade_label, description, sort_order, is_active) VALUES 
-- Special designations that may appear across grading companies
('e0000000-0000-4000-a000-000000000001', 'CGC', 0.0, 'Qualified', 'Graded with qualifying defects noted', 84, true),
('e0000000-0000-4000-a000-000000000002', 'CGC', 0.0, 'Authentic', 'Verified as authentic but not numerically graded', 85, true),
('e0000000-0000-4000-a000-000000000003', 'CBCS', 0.0, 'Authentic', 'Verified as authentic but not numerically graded', 86, true),
('e0000000-0000-4000-a000-000000000004', 'PGX', 0.0, 'Authentic', 'Verified as authentic but not numerically graded', 87, true),

-- Restored grades
('f0000000-0000-4000-a000-000000000001', 'CGC', 0.0, 'Apparent', 'Comic appears to have restoration', 88, true),
('f0000000-0000-4000-a000-000000000002', 'CBCS', 0.0, 'Apparent', 'Comic appears to have restoration', 89, true),
('f0000000-0000-4000-a000-000000000003', 'PGX', 0.0, 'Apparent', 'Comic appears to have restoration', 90, true);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for fast grade lookups
CREATE INDEX IF NOT EXISTS idx_grading_standards_company_value ON grading_standards (company, grade_value);
CREATE INDEX IF NOT EXISTS idx_grading_standards_sort_order ON grading_standards (sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_grading_standards_company_active ON grading_standards (company) WHERE is_active = true;