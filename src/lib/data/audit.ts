import { randomUUID } from "node:crypto";

import { getSupabaseClient } from "./supabase.js";

import type { AuditEntry } from "../models/types.js";

export async function insertAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const client = getSupabaseClient();
    const { error } = (await client.from("audit_logs").insert({
      id: entry.id, created_at: entry.at, action: entry.action,
      table_name: entry.entity_type,
      record_id: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(entry.entity_id) ? entry.entity_id : null,
      new_data: { ...entry.meta, entity_id: entry.entity_id },
    })) as {
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

export async function logSyncOperation(details: unknown): Promise<void> {
  const entityId = typeof (details as any)?.sourceId === "string" ? (details as any).sourceId : "unknown";
  await insertAuditLog({
    id: randomUUID(),
    at: new Date().toISOString(),
    action: "insert",
    entity_type: "sync",
    entity_id: entityId,
    meta: typeof details === "object" && details !== null ? (details as any) : { value: details }
  });
}

export async function logConflictResolution(conflictId: string, decision: string): Promise<void> {
  await insertAuditLog({
    id: randomUUID(),
    at: new Date().toISOString(),
    action: "update",
    entity_type: "conflict",
    entity_id: conflictId,
    meta: { decision }
  });
}
