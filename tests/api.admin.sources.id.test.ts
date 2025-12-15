import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const updateSourceStatusMock = vi.fn(async () => [{ id: "s1" }]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    updateSourceStatus: (...args: any[]) => updateSourceStatusMock(...args),
  };
});

describe("api/admin/sources/[id] PUT + DELETE", () => {
  beforeEach(() => {
    updateSourceStatusMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { PUT } = await import("../src/app/api/admin/sources/[id]/route");
    const request = new Request("http://localhost/api/admin/sources/s1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source_name: "X" }),
    });
    const response = await PUT(request, { params: { id: "s1" } });
    expect(response.status).toBe(401);
  });

  it("updates source fields with PUT", async () => {
    const { PUT } = await import("../src/app/api/admin/sources/[id]/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources/s1", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        cookie: `admin_session=${cookieValue}`,
      },
      body: JSON.stringify({ source_name: "Airbnb", refresh_rate: 30 }),
    });

    const response = await PUT(request, { params: { id: "s1" } });
    expect(response.status).toBe(200);
    expect(updateSourceStatusMock).toHaveBeenCalledWith("s1", {
      source_name: "Airbnb",
      refresh_rate: 30,
    });
  });

  it("soft-deletes by disabling refresh_rate", async () => {
    const { DELETE } = await import("../src/app/api/admin/sources/[id]/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sources/s1", {
      method: "DELETE",
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await DELETE(request, { params: { id: "s1" } });
    expect(response.status).toBe(204);
    expect(updateSourceStatusMock).toHaveBeenCalledWith("s1", { refresh_rate: 0 });
  });
});

