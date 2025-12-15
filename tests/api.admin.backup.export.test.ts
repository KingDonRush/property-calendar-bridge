import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const generateBackupJSONMock = vi.fn(async () => "{\"ok\":true}");

vi.mock("../src/lib/data/backup", () => {
  return {
    generateBackupJSON: (...args: any[]) => generateBackupJSONMock(...args),
  };
});

describe("api/admin/backup/export GET", () => {
  beforeEach(() => {
    generateBackupJSONMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { GET } = await import("../src/app/api/admin/backup/export/route");
    const request = new Request("http://localhost/api/admin/backup/export");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns a downloadable JSON response when authenticated", async () => {
    const { GET } = await import("../src/app/api/admin/backup/export/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/backup/export", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(generateBackupJSONMock).toHaveBeenCalledTimes(1);
    expect(await response.text()).toBe("{\"ok\":true}");
  });
});

