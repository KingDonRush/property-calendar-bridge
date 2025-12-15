import { getSupabaseClient } from "./supabase";

export type ListBookingsArgs = {
  rangeStart: string;
  rangeEnd: string;
};

export async function listBookings(args: ListBookingsArgs): Promise<unknown[]> {
  const client = getSupabaseClient();
  const query = client
    .from("bookings")
    .select("*")
    .gte("start_date", args.rangeStart)
    .lte("end_date", args.rangeEnd);

  const { data, error } = (await query) as { data: unknown[] | null; error: unknown };
  if (error) throw error;
  return data ?? [];
}

export async function upsertBooking(payload: unknown): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client
    .from("bookings")
    .upsert(payload as any, { onConflict: "id" })) as {
    data: unknown;
    error: unknown;
  };
  if (error) throw error;
  return data;
}

export async function getAllSources(): Promise<unknown[]> {
  const client = getSupabaseClient();
  const { data, error } = (await client.from("channel_sources").select("*")) as {
    data: unknown[] | null;
    error: unknown;
  };
  if (error) throw error;
  return data ?? [];
}

export async function createSource(payload: unknown): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client.from("channel_sources").insert(payload as any)) as {
    data: unknown;
    error: unknown;
  };
  if (error) throw error;
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

export async function updateSourceStatus(
  id: string,
  patch: Record<string, unknown>
): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client
    .from("channel_sources")
    .update(patch as any)
    .eq("id", id)) as { data: unknown; error: unknown };
  if (error) throw error;
  return data;
}

export async function getMappingByExternalId(externalUid: string): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client
    .from("booking_mappings")
    .select("*")
    .eq("external_uid", externalUid)) as { data: unknown; error: unknown };
  if (error) throw error;
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

export async function createMapping(payload: unknown): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client.from("booking_mappings").insert(payload as any)) as {
    data: unknown;
    error: unknown;
  };
  if (error) throw error;
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

export async function updateMapping(id: string, patch: Record<string, unknown>): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client
    .from("booking_mappings")
    .update(patch as any)
    .eq("id", id)) as { data: unknown; error: unknown };
  if (error) throw error;
  return data;
}

export async function getSourceById(id: string): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client
    .from("channel_sources")
    .select("*")
    .eq("id", id)) as { data: unknown; error: unknown };
  if (error) throw error;
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

export async function getBookingById(id: string): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client.from("bookings").select("*").eq("id", id)) as {
    data: unknown;
    error: unknown;
  };
  if (error) throw error;
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

export async function createSyncRun(payload: unknown): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client.from("sync_runs").insert(payload as any)) as {
    data: unknown;
    error: unknown;
  };
  if (error) throw error;
  if (Array.isArray(data)) return data[0] ?? null;
  return data ?? null;
}

export async function updateSyncRun(id: string, patch: Record<string, unknown>): Promise<unknown> {
  const client = getSupabaseClient();
  const { data, error } = (await client.from("sync_runs").update(patch as any).eq("id", id)) as {
    data: unknown;
    error: unknown;
  };
  if (error) throw error;
  return data;
}
