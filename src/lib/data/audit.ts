import { getSupabaseClient } from "./supabase";

import type { AuditEntry } from "../models/types";

export async function insertAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const client = getSupabaseClient();
    const { error } = (await client.from("audit_logs").insert(entry as any)) as {
      data: unknown;
      error: unknown;
    };
    if (error) {
      console.error("Failed to insert audit log", error);
    }
  } catch (error) {
    console.error("Failed to insert audit log", error);
  }
}

