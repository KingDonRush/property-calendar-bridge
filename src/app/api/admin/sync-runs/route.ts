import { HTTP_STATUS } from "../../../../lib/constants";
import { jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { listSyncRuns } from "../../../../lib/data/repositories";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function sanitizeLogSummary(value: unknown): unknown {
  if (!isPlainObject(value)) return value;

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (/(stack|token|secret|key)/i.test(key)) continue;
    sanitized[key] = entry;
  }
  return sanitized;
}

function sanitizeSyncRun(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) return {};

  const record = value;
  const out: Record<string, unknown> = {};

  const id = pickString(record, "id");
  if (id) out.id = id;

  const channelSourceId = pickString(record, "channel_source_id");
  if (channelSourceId) out.channel_source_id = channelSourceId;

  const startedAt = pickString(record, "started_at");
  if (startedAt) out.started_at = startedAt;

  const finishedAt = pickString(record, "finished_at");
  if (finishedAt) out.finished_at = finishedAt;

  const status = pickString(record, "status");
  if (status) out.status = status;

  const createdAt = pickString(record, "created_at");
  if (createdAt) out.created_at = createdAt;

  if ("log_summary" in record) {
    out.log_summary = sanitizeLogSummary(record.log_summary);
  }

  return out;
}

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const syncRuns = (await listSyncRuns()).map(sanitizeSyncRun);
  return jsonResponse({ syncRuns }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);
