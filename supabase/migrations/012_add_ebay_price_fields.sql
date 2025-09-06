-- Add eBay integration fields to comics table
-- This migration adds fields for eBay API integration and tiered pricing

-- Add new columns to comics table
ALTER TABLE public.comics 
ADD COLUMN IF NOT EXISTS ebay_low_price decimal(10,2),
ADD COLUMN IF NOT EXISTS ebay_medium_price decimal(10,2),
ADD COLUMN IF NOT EXISTS ebay_high_price decimal(10,2),
ADD COLUMN IF NOT EXISTS ebay_updated_at timestamptz;

-- Add constraints for the new fields
ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_ebay_low_price_positive 
  CHECK (ebay_low_price IS NULL OR ebay_low_price >= 0);

ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_ebay_medium_price_positive 
  CHECK (ebay_medium_price IS NULL OR ebay_medium_price >= 0);

ALTER TABLE public.comics 
ADD CONSTRAINT IF NOT EXISTS comics_ebay_high_price_positive 
  CHECK (ebay_high_price IS NULL OR ebay_high_price >= 0);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS comics_ebay_low_price_idx ON public.comics(ebay_low_price);
CREATE INDEX IF NOT EXISTS comics_ebay_medium_price_idx ON public.comics(ebay_medium_price);
CREATE INDEX IF NOT EXISTS comics_ebay_high_price_idx ON public.comics(ebay_high_price);
CREATE INDEX IF NOT EXISTS comics_ebay_updated_at_idx ON public.comics(ebay_updated_at);

-- Add comments to document the new fields
COMMENT ON COLUMN public.comics.ebay_low_price IS 'eBay market value in GBP (25th percentile of completed listings)';
COMMENT ON COLUMN public.comics.ebay_medium_price IS 'eBay market value in GBP (50th percentile of completed listings)';
COMMENT ON COLUMN public.comics.ebay_high_price IS 'eBay market value in GBP (75th percentile of completed listings)';
COMMENT ON COLUMN public.comics.ebay_updated_at IS 'Timestamp when eBay prices were last updated';