-- Add missing variant_description column to comics table
-- This column is referenced in the wishlist service but was missing from the schema

ALTER TABLE public.comics ADD COLUMN IF NOT EXISTS variant_description text;

-- Add constraint for variant_description length
ALTER TABLE public.comics ADD CONSTRAINT comics_variant_description_length 
  CHECK (char_length(variant_description) <= 500);

-- Create index for better performance when filtering by variant description
CREATE INDEX IF NOT EXISTS comics_variant_description_idx ON public.comics(variant_description);