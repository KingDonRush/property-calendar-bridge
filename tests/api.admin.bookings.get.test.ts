import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const listBookingsMock = vi.fn(async () => [{ id: "b1" }]);
const getAllBookingsMock = vi.fn(async () => [{ id: "b2" }]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    listBookings: (...args: any[]) => listBookingsMock(...args),
    getAllBookings: (...args: any[]) => getAllBookingsMock(...args),
  };
});

describe("api/admin/bookings GET", () => {
  beforeEach(() => {
    listBookingsMock.mockClear();
    getAllBookingsMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("returns 401 when missing admin session", async () => {
    const { GET } = await import("../src/app/api/admin/bookings/route");
    const request = new Request("http://localhost/api/admin/bookings");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 when only one range param is provided", async () => {
    const { GET } = await import("../src/app/api/admin/bookings/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/bookings?rangeStart=2025-01-01", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("lists bookings with rangeStart/rangeEnd", async () => {
    const { GET } = await import("../src/app/api/admin/bookings/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request(
      "http://localhost/api/admin/bookings?rangeStart=2025-01-01&rangeEnd=2025-01-31",
      { headers: { cookie: `admin_session=${cookieValue}` } }
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(listBookingsMock).toHaveBeenCalledWith({ rangeStart: "2025-01-01", rangeEnd: "2025-01-31" });
    expect(await response.json()).toEqual({ bookings: [{ id: "b1" }] });
  });

  it("lists all bookings when no range is provided", async () => {
    const { GET } = await import("../src/app/api/admin/bookings/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/bookings", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(getAllBookingsMock).toHaveBeenCalledTimes(1);
    expect(await response.json()).toEqual({ bookings: [{ id: "b2" }] });
  });
});

