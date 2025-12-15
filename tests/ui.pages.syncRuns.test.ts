import { beforeEach, describe, expect, it, vi } from "vitest";

const getRecentSyncRunsMock = vi.fn(async () => [
    {
        id: "run-1",
        status: "success",
        startedAt: "2025-01-01T10:00:00.000Z",
        durationMs: 5000,
        conflictsCount: 1,
        errorMessage: undefined,
    },
    {
        id: "run-2",
        status: "error",
        startedAt: "2025-01-02T10:00:00.000Z",
        durationMs: undefined,
        conflictsCount: 0,
        errorMessage: "Network error",
    },
]);

vi.mock("../src/lib/ui/syncRuns", () => {
    return {
        getRecentSyncRuns: (...args: any[]) => getRecentSyncRunsMock(...args),
    };
});

describe("ui/pages/sync-runs", () => {
    beforeEach(() => {
        getRecentSyncRunsMock.mockClear();
        vi.resetModules();
    });

    it("renders the table with sync runs data", async () => {
        const { renderSyncRunsPage } = await import("../src/ui/pages/sync-runs");
        const html = await renderSyncRunsPage();

        expect(html).toContain("Histórico de Sincronização");
        expect(html).toContain("run-1");
        expect(html).toContain("success");
        expect(html).toContain("5.0s");

        expect(html).toContain("run-2");
        expect(html).toContain("error");
        expect(html).toContain("Network error");

        expect(getRecentSyncRunsMock).toHaveBeenCalledWith(50);
    });

    it("renders empty state when no runs found", async () => {
        getRecentSyncRunsMock.mockResolvedValueOnce([]);
        const { renderSyncRunsPage } = await import("../src/ui/pages/sync-runs");
        const html = await renderSyncRunsPage();

        expect(html).toContain("Nenhum registro encontrado");
    });
});
