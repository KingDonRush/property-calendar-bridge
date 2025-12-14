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

