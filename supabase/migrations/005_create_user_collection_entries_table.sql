-- Create user_collection_entries table for many-to-many relationship between users and comics
-- This table stores user-specific information about comics in their collection

-- First, create the user_collection_entries table
CREATE TABLE IF NOT EXISTS public.user_collection_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_id uuid NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
  condition text NOT NULL,
  purchase_price decimal(10,2),
  purchase_date date,
  purchase_location text,
  notes text,
  added_date timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT user_collection_entries_condition_check 
    CHECK (condition IN (
      'mint', 'near-mint-plus', 'near-mint', 'near-mint-minus',
      'very-fine-plus', 'very-fine', 'very-fine-minus',
      'fine-plus', 'fine', 'fine-minus',
      'very-good-plus', 'very-good', 'very-good-minus',
      'good-plus', 'good', 'fair', 'poor'
    )),
  CONSTRAINT user_collection_entries_price_positive 
    CHECK (purchase_price IS NULL OR purchase_price >= 0),
  CONSTRAINT user_collection_entries_notes_length 
    CHECK (char_length(notes) <= 1000),
  CONSTRAINT user_collection_entries_purchase_location_length 
    CHECK (char_length(purchase_location) <= 255),
  
  -- Ensure user can only have one entry per comic
  UNIQUE(user_id, comic_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_collection_entries_user_id_idx ON public.user_collection_entries(user_id);
CREATE INDEX IF NOT EXISTS user_collection_entries_comic_id_idx ON public.user_collection_entries(comic_id);
CREATE INDEX IF NOT EXISTS user_collection_entries_condition_idx ON public.user_collection_entries(condition);
CREATE INDEX IF NOT EXISTS user_collection_entries_added_date_idx ON public.user_collection_entries(added_date);
CREATE INDEX IF NOT EXISTS user_collection_entries_purchase_date_idx ON public.user_collection_entries(purchase_date);

-- Enable Row Level Security
ALTER TABLE public.user_collection_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own collection entries
CREATE POLICY "Users can view their own collection entries" ON public.user_collection_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own collection entries
CREATE POLICY "Users can insert their own collection entries" ON public.user_collection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own collection entries
CREATE POLICY "Users can update their own collection entries" ON public.user_collection_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own collection entries
CREATE POLICY "Users can delete their own collection entries" ON public.user_collection_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create an updated_at trigger function for user_collection_entries
CREATE OR REPLACE FUNCTION public.update_user_collection_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on user_collection_entries
DROP TRIGGER IF EXISTS trigger_user_collection_entries_updated_at ON public.user_collection_entries;
CREATE TRIGGER trigger_user_collection_entries_updated_at
  BEFORE UPDATE ON public.user_collection_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_collection_entries_updated_at();