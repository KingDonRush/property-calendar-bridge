import { beforeEach, describe, expect, it } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

describe("api/admin/backup/validate POST", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { POST } = await import("../src/app/api/admin/backup/validate/route");
    const request = new Request("http://localhost/api/admin/backup/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 200 when backup file is valid", async () => {
    const { POST } = await import("../src/app/api/admin/backup/validate/route");
    const cookieValue = createAdminSessionCookieValue();
    const validBackup = {
      meta: { schemaVersion: 1, appVersion: "0.0.0", createdAt: "2025-01-01T00:00:00.000Z" },
      data: { sources: [], bookings: [], mappings: [] },
    };

    const request = new Request("http://localhost/api/admin/backup/validate", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `admin_session=${cookieValue}` },
      body: JSON.stringify(validBackup),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ valid: true });
  });

  it("returns 400 when backup file is invalid", async () => {
    const { POST } = await import("../src/app/api/admin/backup/validate/route");
    const cookieValue = createAdminSessionCookieValue();

    const request = new Request("http://localhost/api/admin/backup/validate", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: `admin_session=${cookieValue}` },
      body: JSON.stringify({ meta: { schemaVersion: 999 }, data: {} }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

