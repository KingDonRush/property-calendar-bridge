import { beforeEach, describe, expect, it, vi } from "vitest";

const getRecentSyncRunsMock = vi.fn(async (..._args: unknown[]) => [
    {
        id: "run-1",
        status: "success",
        started_at: "2025-01-01T10:00:00.000Z",
        finished_at: "2025-01-01T10:00:05.000Z",
        conflictsCount: 1,
        log_summary: { error: undefined },
    },
    {
        id: "run-2",
        status: "failed",
        started_at: "2025-01-02T10:00:00.000Z",
        finished_at: undefined,
        conflictsCount: 0,
        log_summary: { error: "Network error" },
    },
]);

vi.mock("../src/lib/data/repositories", () => {
    return {
        listSyncRuns: getRecentSyncRunsMock,
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
        expect(html).toContain("01/01/2025");
        expect(html).toContain("success");
        expect(html).toContain("5s");

        expect(html).toContain("02/01/2025");
        expect(html).toContain("failed");
        expect(html).toContain("Network error");

        expect(getRecentSyncRunsMock).toHaveBeenCalledWith();
    });

    it("renders empty state when no runs found", async () => {
        getRecentSyncRunsMock.mockResolvedValueOnce([]);
        const { renderSyncRunsPage } = await import("../src/ui/pages/sync-runs");
        const html = await renderSyncRunsPage();

        expect(html).toContain("Nenhum registro encontrado");
    });
});
