-- Create wishlist_items table for user's wishlist functionality
-- This table stores comics that users want to track but don't own yet

-- First, create the wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comic_id uuid NOT NULL REFERENCES public.comics(id) ON DELETE CASCADE,
  target_condition text,
  max_price decimal(10,2),
  notes text,
  added_date timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT wishlist_items_condition_check 
    CHECK (target_condition IS NULL OR target_condition IN (
      'mint', 'near-mint-plus', 'near-mint', 'near-mint-minus',
      'very-fine-plus', 'very-fine', 'very-fine-minus',
      'fine-plus', 'fine', 'fine-minus',
      'very-good-plus', 'very-good', 'very-good-minus',
      'good-plus', 'good', 'fair', 'poor'
    )),
  CONSTRAINT wishlist_items_max_price_positive 
    CHECK (max_price IS NULL OR max_price >= 0),
  CONSTRAINT wishlist_items_notes_length 
    CHECK (char_length(notes) <= 1000),
  
  -- Ensure user can only have one wishlist entry per comic
  UNIQUE(user_id, comic_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS wishlist_items_comic_id_idx ON public.wishlist_items(comic_id);
CREATE INDEX IF NOT EXISTS wishlist_items_target_condition_idx ON public.wishlist_items(target_condition);
CREATE INDEX IF NOT EXISTS wishlist_items_added_date_idx ON public.wishlist_items(added_date);
CREATE INDEX IF NOT EXISTS wishlist_items_max_price_idx ON public.wishlist_items(max_price);

-- Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own wishlist items
CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own wishlist items
CREATE POLICY "Users can update their own wishlist items" ON public.wishlist_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create an updated_at trigger function for wishlist_items
CREATE OR REPLACE FUNCTION public.update_wishlist_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at on wishlist_items
DROP TRIGGER IF EXISTS trigger_wishlist_items_updated_at ON public.wishlist_items;
CREATE TRIGGER trigger_wishlist_items_updated_at
  BEFORE UPDATE ON public.wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wishlist_items_updated_at();