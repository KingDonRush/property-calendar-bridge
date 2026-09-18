import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const listAuditLogsMock = vi.fn(async (..._args: unknown[]) => [{ id: "a1" }]);

vi.mock("../src/lib/audit/service", () => {
  return {
    listAuditLogs: (...args: any[]) => listAuditLogsMock(...args),
  };
});

describe("api/admin/audit GET", () => {
  beforeEach(() => {
    listAuditLogsMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { GET } = await import("../src/app/api/admin/audit/route");
    const request = new Request("http://localhost/api/admin/audit");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("lists audit logs with default pagination", async () => {
    const { GET } = await import("../src/app/api/admin/audit/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/audit", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(listAuditLogsMock).toHaveBeenCalledWith({ limit: 50, offset: 0 });
    expect(await response.json()).toEqual({ auditLogs: [{ id: "a1" }] });
  });

  it("accepts limit/offset query params", async () => {
    const { GET } = await import("../src/app/api/admin/audit/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/audit?limit=10&offset=20", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(listAuditLogsMock).toHaveBeenCalledWith({ limit: 10, offset: 20 });
  });
});

