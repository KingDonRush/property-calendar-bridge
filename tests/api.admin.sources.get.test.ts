import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: vi.fn(async () => [{ id: "1" }, { id: "2" }]),
  };
});

describe("api/admin/sources GET", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { GET } = await import("../src/app/api/admin/sources/route");
    const response = await GET(new Request("http://localhost/api/admin/sources"));
    expect(response.status).toBe(401);
  });

  it("returns sources when admin session cookie is valid", async () => {
    const { GET } = await import("../src/app/api/admin/sources/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ sources: [{ id: "1" }, { id: "2" }] });
  });
});

