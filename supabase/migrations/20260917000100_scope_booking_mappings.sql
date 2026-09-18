-- Fails on duplicate historical mappings rather than discarding data. Resolve duplicates before applying.
create unique index if not exists booking_mappings_source_uid_key
  on public.booking_mappings (channel_source_id, external_uid);
alter type public.booking_status add value if not exists 'blocked';
