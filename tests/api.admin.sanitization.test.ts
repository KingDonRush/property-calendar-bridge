import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAdminSessionCookieValue } from "../src/lib/ui-auth/session";

const listSyncRunsMock = vi.fn(async (..._args: unknown[]) => [
  {
    id: "r1",
    channel_source_id: "s1",
    started_at: "2025-01-01T00:00:00.000Z",
    finished_at: "2025-01-01T00:01:00.000Z",
    status: "failed",
    created_at: "2025-01-01T00:00:00.000Z",
    log_summary: { error: "boom", stack: "trace", SUPABASE_KEY: "x", token: "y" },
    raw_payload: { secret: "z" },
  },
]);

const listBookingsMock = vi.fn(async (..._args: unknown[]) => [
  {
    id: "b1",
    property_id: "p1",
    start_date: "2025-01-01",
    end_date: "2025-01-02",
    guest_name: "John",
    status: "confirmed",
    created_at: "2025-01-01T00:00:00.000Z",
    secret_field: "should-not-leak",
  },
]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    listSyncRuns: (...args: any[]) => listSyncRunsMock(...args),
    listBookings: (...args: any[]) => listBookingsMock(...args),
    getAllBookings: vi.fn(async (..._args: unknown[]) => []),
  };
});

describe("admin API sanitization", () => {
  beforeEach(() => {
    listSyncRunsMock.mockClear();
    listBookingsMock.mockClear();
    vi.resetModules();
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  });

  it("sanitizes sync-runs payload (removes stack/keys/tokens)", async () => {
    const { GET } = await import("../src/app/api/admin/sync-runs/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request("http://localhost/api/admin/sync-runs", {
      headers: { cookie: `admin_session=${cookieValue}` },
    });

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.syncRuns).toHaveLength(1);
    expect(body.syncRuns[0].log_summary).toEqual({ error: "boom" });
    expect(body.syncRuns[0].raw_payload).toBeUndefined();
  });

  it("sanitizes bookings payload (removes unknown fields)", async () => {
    const { GET } = await import("../src/app/api/admin/bookings/route");
    const cookieValue = createAdminSessionCookieValue();
    const request = new Request(
      "http://localhost/api/admin/bookings?rangeStart=2025-01-01&rangeEnd=2025-01-31",
      { headers: { cookie: `admin_session=${cookieValue}` } }
    );

    const response = await GET(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.bookings).toHaveLength(1);
    expect(body.bookings[0]).toMatchObject({ id: "b1", property_id: "p1", guest_name: "John" });
    expect(body.bookings[0].secret_field).toBeUndefined();
  });
});

