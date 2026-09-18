import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const createSourceMock = vi.fn(async (..._args: unknown[]) => ({ id: "new" }));

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: vi.fn(async (..._args: unknown[]) => []),
    createSource: (...args: any[]) => createSourceMock(...args),
  };
});

describe("api/admin/sources POST refresh_rate", () => {
  beforeEach(() => {
    createSourceMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("passes refresh_rate through to createSource", async () => {
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
        refresh_rate: 30,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(createSourceMock).toHaveBeenCalledWith({
      property_id: "p1",
      source_url: "https://example.com/feed.ics",
      source_name: "Airbnb",
      refresh_rate: 30,
    });
  });

  it("returns 400 when refresh_rate is invalid", async () => {
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
        refresh_rate: -1,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

