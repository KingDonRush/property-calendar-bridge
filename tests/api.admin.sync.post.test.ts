import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const runSyncJobMock = vi.fn(async () => ({ ok: true, results: [{ sourceId: "s1", ok: true }] }));

vi.mock("../src/lib/jobs/sync", () => {
  return {
    runSyncJob: (...args: any[]) => runSyncJobMock(...args),
  };
});

describe("api/admin/sync POST", () => {
  beforeEach(() => {
    runSyncJobMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { POST } = await import("../src/app/api/admin/sync/route");
    const request = new Request("http://localhost/api/admin/sync", { method: "POST" });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("triggers runSyncJob when authenticated", async () => {
    const { POST } = await import("../src/app/api/admin/sync/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sync", {
      method: "POST",
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await POST(request);
    expect(response.status).toBe(202);
    expect(runSyncJobMock).toHaveBeenCalledTimes(1);
    expect(await response.json()).toMatchObject({ ok: true });
  });
});

