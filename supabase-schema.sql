-- Run this in your Supabase project: SQL Editor → New query → paste and run

create table if not exists pantry_items (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  cat           text not null check (cat in ('fridge', 'freezer', 'pantry-shelf')),
  store         text not null check (store in ('costco', 'grocery')),
  staple        boolean not null default false,
  stock         text not null default 'full' check (stock in ('full', 'low', 'out')),
  added_to_list boolean not null default false,
  checked_off   boolean not null default false,
  last_bought   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- Enable realtime so both partners see live updates
alter publication supabase_realtime add table pantry_items;

-- Allow public read/write (fine for a private household app on a shared URL)
alter table pantry_items enable row level security;

create policy "Allow all" on pantry_items
  for all using (true) with check (true);
