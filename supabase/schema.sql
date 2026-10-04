-- Luxeshop database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: it only creates what doesn't exist yet and replaces policies.
--
-- Products live in the app bundle; tables here reference them by product id
-- (e.g. "9" or "dj-34"). Row Level Security makes every table private to its
-- owner, except reviews, which anyone can read.

-- ─────────────────────────────────────────────────────────────
-- Profiles: name, phone and delivery address (one row per user)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  line1 text not null default '',
  city text not null default '',
  postcode text not null default '',
  updated_at timestamptz not null default now()
);

-- Create a profile automatically when someone signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before this script ran also need a profile
insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Cart: one row per product + colour + storage line
-- ─────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  line_id text not null,
  product_id text not null,
  name text not null,
  price numeric(10, 2) not null check (price >= 0),
  qty integer not null check (qty > 0),
  color text,
  storage text,
  updated_at timestamptz not null default now(),
  primary key (user_id, line_id)
);

-- ─────────────────────────────────────────────────────────────
-- Wishlist
-- ─────────────────────────────────────────────────────────────
create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ─────────────────────────────────────────────────────────────
-- Orders: line items stored as JSON so an order is saved in one write
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  payment_method text not null default 'card' check (payment_method in ('card', 'cash')),
  promo_code text,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null
);
create index if not exists orders_user_created_idx on public.orders (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Reviews: public to read; only buyers of the product can write, once
-- ─────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  user_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- Profiles: read and update your own
drop policy if exists "profiles: own row" on public.profiles;
create policy "profiles: own row" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Cart and wishlist: full control of your own rows
drop policy if exists "cart: own rows" on public.cart_items;
create policy "cart: own rows" on public.cart_items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "wishlist: own rows" on public.wishlist_items;
create policy "wishlist: own rows" on public.wishlist_items
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Orders: see and place your own; the only change allowed is cancelling
drop policy if exists "orders: read own" on public.orders;
create policy "orders: read own" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "orders: place own" on public.orders;
create policy "orders: place own" on public.orders
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "orders: cancel own" on public.orders;
create policy "orders: cancel own" on public.orders
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "orders: delete own" on public.orders;
create policy "orders: delete own" on public.orders
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Column-level: an update may only set cancelled_at (totals can't be edited)
revoke update on public.orders from authenticated;
grant update (cancelled_at) on public.orders to authenticated;

-- Reviews: anyone (even signed out) can read
drop policy if exists "reviews: public read" on public.reviews;
create policy "reviews: public read" on public.reviews
  for select to anon, authenticated
  using (true);

-- ...but you can only review a product from one of your non-cancelled orders
drop policy if exists "reviews: buyers write" on public.reviews;
create policy "reviews: buyers write" on public.reviews
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.orders o
      where o.user_id = (select auth.uid())
        and o.cancelled_at is null
        and o.items @> jsonb_build_array(jsonb_build_object('id', product_id))
    )
  );

-- Tell the API to pick up the new tables straight away
notify pgrst, 'reload schema';
