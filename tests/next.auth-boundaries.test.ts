import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ cookie: "", from: vi.fn(), sync: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => state.cookie ? { value: state.cookie } : undefined }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../src/lib/data/supabase", () => ({ getSupabaseClient: () => ({ from: state.from }) }));
vi.mock("../src/lib/jobs/sync", () => ({ runSyncJob: state.sync }));
import * as sources from "../src/app/admin/sources/actions";
import * as bookings from "../src/app/admin/reservations/actions";
import * as audit from "../src/app/admin/audit/actions";
import * as sync from "../src/app/admin/sync-runs/actions";
import { createAdminSessionCookieValue, isValidAdminSessionCookieValue } from "../src/lib/ui-auth/session";
import { proxy } from "../src/proxy";
import { NextRequest } from "next/server";

beforeEach(() => { vi.stubEnv("ADMIN_UI_TOKEN", "test-only-admin"); state.from.mockReset(); state.sync.mockReset(); state.cookie = ""; });
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("Next authentication boundaries", () => {
  const calls = [() => sources.getSources(), () => sources.createSource(new FormData()),
    () => sources.updateSource("s1", new FormData()), () => sources.deleteSource("s1"),
    () => sources.testSourceConnection("https://example.com/calendar.ics"),
    () => bookings.getBookings(), () => bookings.getBookingStats(),
    () => audit.getAuditLogs(), () => audit.getAuditLogStats(),
    () => sync.getSyncLogs(), () => sync.triggerSync()];
  it.each(["", `${"a".repeat(36)}.${"b".repeat(64)}`])("rejects unauthenticated and forged cookies before side effects", async cookie => {
    state.cookie = cookie;
    for (const call of calls) expect((await call()).success).toBe(false);
    expect(state.from).not.toHaveBeenCalled(); expect(state.sync).not.toHaveBeenCalled();
    const response = proxy(new NextRequest("http://localhost/admin", { headers: { cookie: `admin_session=${cookie}` } }));
    expect(response.headers.get("location")).toBe("http://localhost/login");
  });
  it("validates signatures and rejects expired signed sessions", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const cookie = createAdminSessionCookieValue();
    expect(isValidAdminSessionCookieValue(cookie)).toBe(true);
    expect(isValidAdminSessionCookieValue(cookie.replace(/.$/, cookie.endsWith("f") ? "e" : "f"))).toBe(false);
    vi.advanceTimersByTime(7 * 24 * 60 * 60 * 1000);
    expect(isValidAdminSessionCookieValue(cookie)).toBe(false);
  });
  it("reports actual persisted imports and source failures from the shared sync job", async () => {
    state.cookie = createAdminSessionCookieValue();
    state.sync.mockResolvedValueOnce({ ok: true, results: [{ sourceId: "s1", ok: true, result: { imported: 2, upserted: 3 } }] });
    expect(await sync.triggerSync()).toEqual({ success: true, data: { sourcesProcessed: 1, totalImported: 2 } });
    expect(state.sync).toHaveBeenCalledOnce(); expect(state.from).not.toHaveBeenCalled();
    state.sync.mockResolvedValueOnce({ ok: true, results: [{ sourceId: "s1", ok: false, error: "write failed" }] });
    expect((await sync.triggerSync()).success).toBe(false);
  });
});
