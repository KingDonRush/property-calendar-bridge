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
  const [sources, syncRuns] = await Promise.all([getAllSources(), listSyncRuns()]);

  const sourcesCount = Array.isArray(sources) ? sources.length : 0;

  const last = Array.isArray(syncRuns) ? syncRuns[0] : null;
  const startedAt = typeof (last as any)?.started_at === "string" ? (last as any).started_at : undefined;
  const status = typeof (last as any)?.status === "string" ? (last as any).status : undefined;
  const lastSyncRun = startedAt || status ? { startedAt, status } : null;

  return {
    health: { status: "ok", timestamp: now },
    sourcesCount,
    lastSyncRun,
  };
}

