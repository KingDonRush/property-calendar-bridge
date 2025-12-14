do $$
begin
  create type public.conflict_type as enum ('overlap', 'double_booking');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.conflict_status as enum ('open', 'resolved');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.conflicts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  booking_ids uuid[] not null default '{}'::uuid[],
  conflict_type public.conflict_type not null default 'overlap',
  status public.conflict_status not null default 'open',
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);

