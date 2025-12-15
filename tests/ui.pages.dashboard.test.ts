import { beforeEach, describe, expect, it, vi } from "vitest";

const getDashboardStatsMock = vi.fn(async () => ({
  health: { status: "ok", timestamp: "2025-01-01T00:00:00.000Z" },
  sourcesCount: 2,
  lastSyncRun: null,
}));

vi.mock("../src/lib/ui/dashboardStats", () => {
  return {
    getDashboardStats: (...args: any[]) => getDashboardStatsMock(...args),
  };
});

describe("ui/pages/Dashboard", () => {
  beforeEach(() => {
    getDashboardStatsMock.mockClear();
    vi.resetModules();
  });

  it("renders the dashboard heading and loads stats", async () => {
    const { renderDashboardPage } = await import("../src/ui/pages/Dashboard");
    const html = await renderDashboardPage();
    expect(html).toContain("Dashboard");
    expect(getDashboardStatsMock).toHaveBeenCalledTimes(1);
  });
});

