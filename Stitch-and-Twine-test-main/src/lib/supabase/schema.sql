-- ═══════════════════════════════════════════════════════════════
-- Stitch & Twine — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up all tables.
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles (extends Supabase auth.users) ──
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        text default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz default now()
);

-- ── Categories ──
create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  slug        text unique not null,
  description text default '',
  image       text default '',
  created_at  timestamptz default now()
);

-- ── Products ──
create table if not exists public.products (
  id             text primary key,
  name           text not null,
  slug           text unique not null,
  description    text default '',
  price          numeric not null default 0,
  compare_price  numeric,
  images         jsonb default '[]',
  category       text not null,
  category_slug  text references public.categories(slug),
  is_feature     boolean default false,
  is_active      boolean default true,
  stock          integer default 0,
  variants       jsonb default '[]',
  tags           jsonb default '[]',
  rating         numeric default 0,
  review_count   integer default 0,
  created_at     timestamptz default now()
);

-- ── Orders ──
create table if not exists public.orders (
  id               text primary key,
  order_number     text unique not null,
  customer_name    text not null,
  customer_phone   text not null,
  customer_email   text default '',
  shipping_address text not null,
  city             text not null,
  items            jsonb not null default '[]',
  subtotal         numeric not null default 0,
  delivery_fee     numeric not null default 0,
  discount         numeric not null default 0,
  total            numeric not null default 0,
  coupon_code      text,
  status           text default 'pending' check (status in ('pending','processing','completed','cancelled')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Coupons ──
create table if not exists public.coupons (
  id               text primary key,
  code             text unique not null,
  discount_type    text not null check (discount_type in ('percentage','fixed')),
  discount_value   numeric not null default 0,
  min_order_amount numeric,
  is_active        boolean default true,
  expires_at       timestamptz,
  created_at       timestamptz default now()
);

-- ── Banners / Hero Sliders ──
create table if not exists public.banners (
  id          text primary key,
  title       text not null,
  subtitle    text default '',
  description text default '',
  image       text not null,
  cta_text    text default 'Shop Now',
  cta_link    text default '/shop',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ── Settings (single-row table) ──
create table if not exists public.settings (
  id                      integer primary key default 1 check (id = 1),
  site_name               text default 'Stitch and Twine',
  whatsapp_number         text default '923190691621',
  delivery_fee            numeric default 250,
  free_delivery_threshold numeric default 0,
  email                   text default 'hello@stitchandtwine.com',
  address                 text default 'Rawalpindi, Pakistan',
  instagram               text,
  facebook                text,
  updated_at              timestamptz default now()
);

-- ── Row-Level Security (basic — enable RLS and allow public read) ──
alter table public.products  enable row level security;
alter table public.categories enable row level security;
alter table public.orders    enable row level security;
alter table public.coupons   enable row level security;
alter table public.banners   enable row level security;
alter table public.settings  enable row level security;
alter table public.profiles  enable row level security;

-- Public read for storefront
create policy "Public read products"  on public.products  for select using (true);
create policy "Public read categories" on public.categories for select using (true);
create policy "Public read banners"   on public.banners   for select using (is_active = true);
create policy "Public read settings"  on public.settings  for select using (true);
create policy "Public read coupons"   on public.coupons   for select using (is_active = true);

-- Customers can insert orders
create policy "Customers create orders" on public.orders for insert with check (true);

-- Admin full access (requires role = 'admin' in profiles)
create policy "Admin full products"  on public.products  for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full categories" on public.categories for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full orders" on public.orders for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full coupons" on public.coupons for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full banners" on public.banners for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full settings" on public.settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
