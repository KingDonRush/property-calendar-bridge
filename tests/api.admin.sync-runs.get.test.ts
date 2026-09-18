import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const listSyncRunsMock = vi.fn(async (..._args: unknown[]) => [{ id: "r1" }]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    listSyncRuns: (...args: any[]) => listSyncRunsMock(...args),
  };
});

describe("api/admin/sync-runs GET", () => {
  beforeEach(() => {
    listSyncRunsMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { GET } = await import("../src/app/api/admin/sync-runs/route");
    const request = new Request("http://localhost/api/admin/sync-runs");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("lists sync runs when authenticated", async () => {
    const { GET } = await import("../src/app/api/admin/sync-runs/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sync-runs", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(listSyncRunsMock).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ syncRuns: [{ id: "r1" }] });
  });
});

