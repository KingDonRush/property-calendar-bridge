create index if not exists channel_sources_property_id_idx
  on public.channel_sources (property_id);

create index if not exists bookings_property_dates_idx
  on public.bookings (property_id, start_date, end_date);

create index if not exists booking_mappings_external_uid_idx
  on public.booking_mappings (external_uid);

create index if not exists sync_runs_channel_source_started_at_idx
  on public.sync_runs (channel_source_id, started_at);

create index if not exists conflicts_property_status_idx
  on public.conflicts (property_id, status);

alter table public.properties enable row level security;
alter table public.channel_sources enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_mappings enable row level security;
alter table public.sync_runs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.conflicts enable row level security;

do $$
begin
  create policy "service_role_all_properties" on public.properties
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "service_role_all_channel_sources" on public.channel_sources
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "service_role_all_bookings" on public.bookings
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "service_role_all_booking_mappings" on public.booking_mappings
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "service_role_all_sync_runs" on public.sync_runs
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "service_role_all_audit_logs" on public.audit_logs
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "service_role_all_conflicts" on public.conflicts
    for all to service_role using (true) with check (true);
exception
  when duplicate_object then null;
end
$$;

