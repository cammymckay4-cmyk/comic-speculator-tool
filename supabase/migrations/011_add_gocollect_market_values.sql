-- Add GoCollect integration fields to comics table
-- This migration adds fields for GoCollect API integration and tiered market values

-- Add new columns to comics table
ALTER TABLE public.comics 
ADD COLUMN IF NOT EXISTS gocollect_id text,
ADD COLUMN IF NOT EXISTS market_value_low decimal(10,2),
ADD COLUMN IF NOT EXISTS market_value_medium decimal(10,2),
ADD COLUMN IF NOT EXISTS market_value_high decimal(10,2),
ADD COLUMN IF NOT EXISTS market_value_updated_at timestamptz;

-- Add constraints for the new fields
ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_market_value_low_positive 
  CHECK (market_value_low IS NULL OR market_value_low >= 0);

ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_market_value_medium_positive 
  CHECK (market_value_medium IS NULL OR market_value_medium >= 0);

ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_market_value_high_positive 
  CHECK (market_value_high IS NULL OR market_value_high >= 0);

ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_gocollect_id_length 
  CHECK (gocollect_id IS NULL OR char_length(gocollect_id) <= 100);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS comics_gocollect_id_idx ON public.comics(gocollect_id);
CREATE INDEX IF NOT EXISTS comics_market_value_low_idx ON public.comics(market_value_low);
CREATE INDEX IF NOT EXISTS comics_market_value_medium_idx ON public.comics(market_value_medium);
CREATE INDEX IF NOT EXISTS comics_market_value_high_idx ON public.comics(market_value_high);
CREATE INDEX IF NOT EXISTS comics_market_value_updated_at_idx ON public.comics(market_value_updated_at);

-- Add unique constraint for GoCollect ID (each comic should have unique ID)
CREATE UNIQUE INDEX IF NOT EXISTS comics_gocollect_id_unique_idx 
  ON public.comics(gocollect_id) 
  WHERE gocollect_id IS NOT NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN public.comics.gocollect_id IS 'GoCollect API item ID for market value lookups';
COMMENT ON COLUMN public.comics.market_value_low IS 'Fair market value in GBP for grade 6.0 condition';
COMMENT ON COLUMN public.comics.market_value_medium IS 'Fair market value in GBP for grade 8.0 condition';
COMMENT ON COLUMN public.comics.market_value_high IS 'Fair market value in GBP for grade 9.4 condition';
COMMENT ON COLUMN public.comics.market_value_updated_at IS 'Timestamp when market values were last updated from GoCollect';