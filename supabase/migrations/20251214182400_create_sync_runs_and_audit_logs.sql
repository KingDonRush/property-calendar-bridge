do $$
begin
  create type public.sync_run_status as enum ('running', 'success', 'failed', 'partial');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.audit_action as enum ('insert', 'update', 'delete');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  channel_source_id uuid references public.channel_sources (id) on delete set null,
  started_at timestamptz not null,
  finished_at timestamptz,
  status public.sync_run_status not null default 'running',
  log_summary jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  action public.audit_action not null,
  old_data jsonb,
  new_data jsonb,
  changed_by text,
  created_at timestamptz not null default now()
);

