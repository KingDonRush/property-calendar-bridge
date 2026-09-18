import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const createSourceMock = vi.fn(async (..._args: unknown[]) => ({ id: "new" }));

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: vi.fn(async (..._args: unknown[]) => []),
    createSource: (...args: any[]) => createSourceMock(...args),
  };
});

describe("api/admin/sources POST", () => {
  beforeEach(() => {
    createSourceMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { POST } = await import("../src/app/api/admin/sources/route");
    const request = new Request("http://localhost/api/admin/sources", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ property_id: "p1", source_url: "https://example.com/ics" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 when url is invalid", async () => {
    const { POST } = await import("../src/app/api/admin/sources/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `admin_session=${cookieValue}`,
      },
      body: JSON.stringify({ property_id: "p1", source_url: "not-a-url" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates source and returns 201", async () => {
    const { POST } = await import("../src/app/api/admin/sources/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `admin_session=${cookieValue}`,
      },
      body: JSON.stringify({
        property_id: "p1",
        source_url: "https://example.com/feed.ics",
        source_name: "Airbnb",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(createSourceMock).toHaveBeenCalledWith({
      property_id: "p1",
      source_url: "https://example.com/feed.ics",
      source_name: "Airbnb",
    });
    expect(await response.json()).toEqual({ source: { id: "new" } });
  });
});

