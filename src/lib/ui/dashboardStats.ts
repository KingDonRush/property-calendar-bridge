import { getAllSources, listSyncRuns } from "../data/repositories";

export type DashboardHealth = {
  status: "ok";
  timestamp: string;
};

export type DashboardLastSyncRun = {
  startedAt?: string;
  status?: string;
};

export type DashboardStats = {
  health: DashboardHealth;
  sourcesCount: number;
  lastSyncRun: DashboardLastSyncRun | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date().toISOString();
  let sources: unknown[] = [];
  let syncRuns: unknown[] = [];

  try {
    const result = await Promise.all([getAllSources(), listSyncRuns()]);
    sources = Array.isArray(result[0]) ? result[0] : [];
    syncRuns = Array.isArray(result[1]) ? result[1] : [];
  } catch {
    return {
      health: { status: "ok", timestamp: now },
      sourcesCount: 0,
      lastSyncRun: null
    };
  }

  const sourcesCount = sources.length;

  const last = syncRuns[0] ?? null;
  const startedAt = typeof (last as any)?.started_at === "string" ? (last as any).started_at : undefined;
  const status = typeof (last as any)?.status === "string" ? (last as any).status : undefined;
  const lastSyncRun = startedAt || status ? { startedAt, status } : null;

  return {
    health: { status: "ok", timestamp: now },
    sourcesCount,
    lastSyncRun,
  };
}
