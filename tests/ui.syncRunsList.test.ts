import { beforeEach, describe, expect, it, vi } from "vitest";

const listSyncRunsMock = vi.fn(async () => [
  {
    id: "run-1",
    status: "success",
    started_at: "2025-01-01T00:00:00.000Z",
    finished_at: "2025-01-01T00:05:00.000Z",
    log_summary: { conflictsCount: 2, token: "should-not-leak" },
  },
]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    listSyncRuns: (...args: any[]) => listSyncRunsMock(...args),
  };
});

describe("ui sync runs service", () => {
  beforeEach(() => {
    listSyncRunsMock.mockClear();
    vi.resetModules();
  });

  it("normalizes sync runs and sanitizes log summary", async () => {
    const { getRecentSyncRuns } = await import("../src/lib/ui/syncRuns");
    const runs = await getRecentSyncRuns(10);

    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      id: "run-1",
      status: "success",
      conflictsCount: 2,
      durationMs: 5 * 60 * 1000,
    });
    expect((runs[0].logSummary as any).token).toBeUndefined();
  });

  it("returns empty on repository failure", async () => {
    listSyncRunsMock.mockRejectedValueOnce(new Error("boom"));
    const { getRecentSyncRuns } = await import("../src/lib/ui/syncRuns");
    const runs = await getRecentSyncRuns();
    expect(runs).toEqual([]);
  });
});

