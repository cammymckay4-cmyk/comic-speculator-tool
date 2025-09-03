-- Refactor comics table to be a master list and migrate existing user data
-- This migration transforms the current comics table into a clean master list
-- and migrates user-specific data to user_collection_entries

-- Step 1: Create the new clean comics table structure
-- First, let's create a new comics table with only master data
CREATE TABLE IF NOT EXISTS public.comics_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issue text NOT NULL,
  publisher text NOT NULL,
  cover_image text DEFAULT '',
  market_value decimal(10,2) DEFAULT 0,
  publication_year integer,
  format text DEFAULT 'single-issue',
  is_key_issue boolean DEFAULT false,
  key_issue_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT comics_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
  CONSTRAINT comics_issue_length CHECK (char_length(issue) >= 1 AND char_length(issue) <= 50),
  CONSTRAINT comics_publisher_length CHECK (char_length(publisher) >= 1 AND char_length(publisher) <= 100),
  CONSTRAINT comics_market_value_positive CHECK (market_value >= 0),
  CONSTRAINT comics_publication_year_valid 
    CHECK (publication_year IS NULL OR (publication_year >= 1800 AND publication_year <= EXTRACT(YEAR FROM now()) + 1)),
  CONSTRAINT comics_format_check 
    CHECK (format IN (
      'single-issue', 'trade-paperback', 'hardcover', 'graphic-novel',
      'omnibus', 'deluxe-edition', 'treasury-edition', 'magazine', 'digital'
    )),
  CONSTRAINT comics_key_issue_reason_length CHECK (char_length(key_issue_reason) <= 500),
  
  -- Ensure unique comics in the master list (title + issue + publisher)
  UNIQUE(title, issue, publisher)
);

-- Step 2: Migrate existing data
-- First, insert unique comics into the new table
INSERT INTO public.comics_new (
  title, issue, publisher, cover_image, market_value, 
  publication_year, format, is_key_issue, key_issue_reason, created_at
)
SELECT DISTINCT ON (title, issue, publisher)
  title,
  issue,
  publisher,
  COALESCE(cover_image, ''),
  COALESCE(market_value, 0),
  publication_year,
  COALESCE(format, 'single-issue'),
  COALESCE(is_key_issue, false),
  key_issue_reason,
  MIN(created_at) -- Use the earliest creation date for each unique comic
FROM public.comics
WHERE title IS NOT NULL AND issue IS NOT NULL AND publisher IS NOT NULL
GROUP BY title, issue, publisher, cover_image, market_value, publication_year, format, is_key_issue, key_issue_reason;

-- Step 3: Migrate user collection data to user_collection_entries
-- For each existing comic, create corresponding user_collection_entries
INSERT INTO public.user_collection_entries (
  user_id, comic_id, condition, purchase_price, purchase_date, 
  purchase_location, notes, added_date
)
SELECT 
  c_old.user_id,
  c_new.id,
  COALESCE(c_old.condition, 'near-mint'),
  c_old.purchase_price,
  c_old.purchase_date::date,
  c_old.purchase_location,
  c_old.notes,
  c_old.created_at
FROM public.comics c_old
INNER JOIN public.comics_new c_new ON (
  c_old.title = c_new.title AND 
  c_old.issue = c_new.issue AND 
  c_old.publisher = c_new.publisher
)
WHERE c_old.user_id IS NOT NULL;

-- Step 4: Replace the old table with the new one
-- Drop the old table (this will cascade to any foreign keys)
DROP TABLE IF EXISTS public.comics CASCADE;

-- Rename the new table to comics
ALTER TABLE public.comics_new RENAME TO comics;

-- Step 5: Create indexes on the new comics table
CREATE INDEX IF NOT EXISTS comics_title_idx ON public.comics(title);
CREATE INDEX IF NOT EXISTS comics_publisher_idx ON public.comics(publisher);
CREATE INDEX IF NOT EXISTS comics_publication_year_idx ON public.comics(publication_year);
CREATE INDEX IF NOT EXISTS comics_market_value_idx ON public.comics(market_value);
CREATE INDEX IF NOT EXISTS comics_is_key_issue_idx ON public.comics(is_key_issue);
CREATE INDEX IF NOT EXISTS comics_created_at_idx ON public.comics(created_at);

-- Step 6: Enable Row Level Security on comics table
ALTER TABLE public.comics ENABLE ROW LEVEL SECURITY;

-- Comics table is readable by everyone (it's a master list)
CREATE POLICY "Comics are publicly readable" ON public.comics
  FOR SELECT USING (true);

-- Only authenticated users can suggest new comics (insert)
-- In a real app, you might want more restrictive policies
CREATE POLICY "Authenticated users can add comics" ON public.comics
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update comics
-- In a real app, you might want admin-only policies
CREATE POLICY "Authenticated users can update comics" ON public.comics
  FOR UPDATE TO authenticated
  USING (true);

-- Step 7: Create an updated_at trigger function for comics
CREATE OR REPLACE FUNCTION public.update_comics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on comics
DROP TRIGGER IF EXISTS trigger_comics_updated_at ON public.comics;
CREATE TRIGGER trigger_comics_updated_at
  BEFORE UPDATE ON public.comics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comics_updated_at();