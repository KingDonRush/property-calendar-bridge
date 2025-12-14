do $$
begin
  create type public.booking_status as enum ('confirmed', 'tentative', 'cancelled');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  guest_name text,
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists public.booking_mappings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  channel_source_id uuid not null references public.channel_sources (id) on delete cascade,
  external_uid text not null,
  original_data jsonb,
  created_at timestamptz not null default now()
);

