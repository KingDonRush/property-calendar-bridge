import { getSupabaseClient } from "../data/supabase.js";

export type ListAuditLogsArgs = {
  limit: number;
  offset: number;
};

export async function listAuditLogs(args: ListAuditLogsArgs): Promise<unknown[]> {
  const limit = args.limit;
  const offset = args.offset;

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("limit must be a positive integer");
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("offset must be a non-negative integer");
  }

  const client = getSupabaseClient();
  const { data, error } = (await client
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)) as { data: unknown[] | null; error: unknown };

  if (error) throw error;
  return data ?? [];
}

