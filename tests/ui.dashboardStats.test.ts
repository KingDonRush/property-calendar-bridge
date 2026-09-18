import { beforeEach, describe, expect, it, vi } from "vitest";

const getAllSourcesMock = vi.fn(async (..._args: unknown[]) => [{ id: "s1" }, { id: "s2" }]);
const listSyncRunsMock = vi.fn(async (..._args: unknown[]) => [
  { id: "r1", started_at: "2025-01-01T00:00:00.000Z", status: "success" },
]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: (...args: any[]) => getAllSourcesMock(...args),
    listSyncRuns: (...args: any[]) => listSyncRunsMock(...args),
  };
});

describe("ui dashboard stats service", () => {
  beforeEach(() => {
    getAllSourcesMock.mockClear();
    listSyncRunsMock.mockClear();
    vi.resetModules();
  });

  it("returns counts and last sync info", async () => {
    const { getDashboardStats } = await import("../src/lib/ui/dashboardStats");
    const stats = await getDashboardStats();

    expect(stats.sourcesCount).toBe(2);
    expect(stats.lastSyncRun).toMatchObject({ startedAt: "2025-01-01T00:00:00.000Z", status: "success" });
    expect(stats.health.status).toBe("ok");
  });

  it("handles missing sync runs", async () => {
    listSyncRunsMock.mockResolvedValueOnce([]);
    const { getDashboardStats } = await import("../src/lib/ui/dashboardStats");
    const stats = await getDashboardStats();
    expect(stats.lastSyncRun).toBeNull();
  });
});

