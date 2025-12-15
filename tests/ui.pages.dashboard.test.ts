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

  it("renders summary cards with health, sources and last sync", async () => {
    getDashboardStatsMock.mockResolvedValueOnce({
      health: { status: "ok", timestamp: "2025-01-01T00:00:00.000Z" },
      sourcesCount: 2,
      lastSyncRun: { startedAt: "2025-01-01T00:00:00.000Z", status: "success" },
    });

    const { renderDashboardPage } = await import("../src/ui/pages/Dashboard");
    const html = await renderDashboardPage();

    expect(html).toContain("Status do sistema");
    expect(html).toContain("ok");
    expect(html).toContain("Total de fontes");
    expect(html).toContain("2");
    expect(html).toContain("Ultima sincronizacao");
    expect(html).toContain("success");
  });

  it("includes a Sync Now button and client-side script", async () => {
    const { renderDashboardPage } = await import("../src/ui/pages/Dashboard");
    const html = await renderDashboardPage();
    expect(html).toContain('id="btn-sync-now"');
    expect(html).toContain("/api/admin/sync");
    expect(html).toContain("window.location.reload");
  });
});
