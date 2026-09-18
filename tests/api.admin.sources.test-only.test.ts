import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const fetchAndParseIcsMock = vi.fn(async (..._args: unknown[]) => [{ uid: "u1" }, { uid: "u2" }]);

vi.mock("../src/lib/ical/sync", () => {
  return {
    fetchAndParseIcs: (...args: any[]) => fetchAndParseIcsMock(...args),
  };
});

describe("api/admin/sources/test POST", () => {
  beforeEach(() => {
    fetchAndParseIcsMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { POST } = await import("../src/app/api/admin/sources/test/route");
    const request = new Request("http://localhost/api/admin/sources/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/feed.ics" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns { valid: true, eventCount } when url is valid", async () => {
    const { POST } = await import("../src/app/api/admin/sources/test/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `admin_session=${cookieValue}`,
      },
      body: JSON.stringify({ url: "https://example.com/feed.ics" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(fetchAndParseIcsMock).toHaveBeenCalledWith("https://example.com/feed.ics", expect.any(Object));
    expect(await response.json()).toEqual({ valid: true, eventCount: 2 });
  });

  it("returns 400 when url is invalid", async () => {
    const { POST } = await import("../src/app/api/admin/sources/test/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `admin_session=${cookieValue}`,
      },
      body: JSON.stringify({ url: "notaurl" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when fetch/parse fails", async () => {
    fetchAndParseIcsMock.mockRejectedValueOnce(new Error("boom"));
    const { POST } = await import("../src/app/api/admin/sources/test/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `admin_session=${cookieValue}`,
      },
      body: JSON.stringify({ url: "https://example.com/feed.ics" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: true });
  });
});

