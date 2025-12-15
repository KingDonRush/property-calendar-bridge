import { listSyncRuns } from "../data/repositories";

export type UiSyncRun = {
  id?: string;
  status?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  conflictsCount?: number;
  errorMessage?: string;
  logSummary?: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function parseDateMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  const ms = date.getTime();
  return Number.isFinite(ms) ? ms : undefined;
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

function extractConflictsCount(logSummary: unknown): number | undefined {
  if (!isPlainObject(logSummary)) return undefined;

  for (const [key, value] of Object.entries(logSummary)) {
    if (!/conflict/i.test(key)) continue;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return undefined;
}

function normalizeSyncRun(raw: unknown): UiSyncRun {
  if (!isPlainObject(raw)) return {};

  const startedAt = pickString(raw, "started_at");
  const finishedAt = pickString(raw, "finished_at");
  const startedMs = parseDateMs(startedAt);
  const finishedMs = parseDateMs(finishedAt);

  const logSummary = "log_summary" in raw ? sanitizeLogSummary(raw.log_summary) : undefined;
  const conflictsCount = extractConflictsCount(logSummary);

  const status = pickString(raw, "status");

  const errorMessage =
    status && status !== "success" && isPlainObject(logSummary) && typeof logSummary.error === "string"
      ? logSummary.error
      : undefined;

  return {
    id: pickString(raw, "id"),
    status,
    startedAt,
    finishedAt,
    durationMs: startedMs !== undefined && finishedMs !== undefined && finishedMs >= startedMs ? finishedMs - startedMs : undefined,
    conflictsCount,
    errorMessage,
    logSummary,
  };
}

export async function getRecentSyncRuns(limit = 50): Promise<UiSyncRun[]> {
  try {
    const runs = await listSyncRuns();
    if (!Array.isArray(runs)) return [];
    return runs.slice(0, Math.max(0, limit)).map(normalizeSyncRun);
  } catch {
    return [];
  }
}

