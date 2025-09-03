-- Create wishlists table
create table if not exists wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  comic_id uuid references comics(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  
  -- Add unique constraint to prevent duplicate entries
  unique(user_id, comic_id)
);

-- Enable RLS
alter table wishlists enable row level security;

-- RLS policies for wishlists
create policy "Users can view their own wishlists" 
  on wishlists for select 
  using (auth.uid() = user_id);

create policy "Users can insert into their own wishlists" 
  on wishlists for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete from their own wishlists" 
  on wishlists for delete 
  using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_wishlists_user_id on wishlists(user_id);
create index if not exists idx_wishlists_comic_id on wishlists(comic_id);
create index if not exists idx_wishlists_created_at on wishlists(created_at);