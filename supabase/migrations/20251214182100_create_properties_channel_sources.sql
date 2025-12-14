create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.channel_sources (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  source_url text not null,
  source_name text,
  refresh_rate int,
  created_at timestamptz not null default now()
);

