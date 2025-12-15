import { describe, expect, it } from "vitest";

import { requireAdminSession } from "../src/lib/ui-auth/guard";
import { ADMIN_SESSION_COOKIE_NAME, createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

describe("lib/ui-auth/guard requireAdminSession", () => {
  it("returns 401 JSON when request expects JSON", () => {
    const request = new Request("http://localhost/api/admin/sources", {
      headers: { accept: "application/json" },
    });

    const response = requireAdminSession(request);
    expect(response?.status).toBe(401);
    expect(response?.headers.get("content-type") ?? "").toContain("application/json");
  });

  it("redirects to /login when request expects HTML", () => {
    const request = new Request("http://localhost/admin", {
      headers: { accept: "text/html" },
    });

    const response = requireAdminSession(request);
    expect(response?.status).toBe(302);
    expect(response?.headers.get("location")).toBe("http://localhost/login");
  });

  it("returns null when cookie is present and valid", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/admin", {
      headers: { cookie: `${ADMIN_SESSION_COOKIE_NAME}=${cookieValue}`, accept: "text/html" },
    });

    expect(requireAdminSession(request)).toBeNull();
  });
});

