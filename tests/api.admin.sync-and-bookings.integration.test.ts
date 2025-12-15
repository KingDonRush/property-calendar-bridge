import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const listSyncRunsMock = vi.fn(async () => [
  {
    id: "r1",
    channel_source_id: "s1",
    started_at: "2025-01-01T00:00:00.000Z",
    status: "failed",
    log_summary: { error: "boom", stack: "trace", token: "x" },
  },
]);

const listBookingsMock = vi.fn(async () => [
  {
    id: "b1",
    property_id: "p1",
    start_date: "2025-01-01",
    end_date: "2025-01-02",
    guest_name: "John",
    status: "confirmed",
    secret_field: "should-not-leak",
  },
]);

const runSyncJobMock = vi.fn(async () => ({ ok: true, results: [{ sourceId: "s1", ok: true }] }));

vi.mock("../src/lib/data/repositories", () => {
  return {
    listSyncRuns: (...args: any[]) => listSyncRunsMock(...args),
    listBookings: (...args: any[]) => listBookingsMock(...args),
    getAllBookings: vi.fn(async () => []),
  };
});

vi.mock("../src/lib/jobs/sync", () => {
  return {
    runSyncJob: (...args: any[]) => runSyncJobMock(...args),
  };
});

function setRequiredEnv(): void {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_KEY = "key";
  process.env.ICAL_MASTER_SECRET = "ical";
  process.env.CRON_SECRET_TOKEN = "token";
  process.env.ADMIN_UI_TOKEN = "admin";
}

describe("integration: admin sync-runs/bookings/sync endpoints", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    listSyncRunsMock.mockClear();
    listBookingsMock.mockClear();
    runSyncJobMock.mockClear();
    vi.resetModules();
    setRequiredEnv();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
    const { createHttpServer } = await import("../src/httpServer");
    const server = createHttpServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://localhost:${port}`;

    try {
      return await fn(baseUrl);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  async function loginAndGetCookie(baseUrl: string): Promise<string> {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "token=admin",
    });
    expect(response.status).toBe(302);
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("admin_session=");
    return setCookie;
  }

  it("blocks unauthenticated access with 401", async () => {
    await withServer(async (baseUrl) => {
      const syncRunsResponse = await fetch(`${baseUrl}/api/admin/sync-runs`);
      expect(syncRunsResponse.status).toBe(401);

      const bookingsResponse = await fetch(
        `${baseUrl}/api/admin/bookings?rangeStart=2025-01-01&rangeEnd=2025-01-31`
      );
      expect(bookingsResponse.status).toBe(401);

      const syncResponse = await fetch(`${baseUrl}/api/admin/sync`, { method: "POST" });
      expect(syncResponse.status).toBe(401);
    });
  });

  it("supports authenticated access and sanitizes payloads", async () => {
    await withServer(async (baseUrl) => {
      const cookie = await loginAndGetCookie(baseUrl);

      const syncRunsResponse = await fetch(`${baseUrl}/api/admin/sync-runs`, { headers: { cookie } });
      expect(syncRunsResponse.status).toBe(200);
      const syncRunsBody = await syncRunsResponse.json();
      expect(syncRunsBody.syncRuns[0].log_summary).toEqual({ error: "boom" });
      expect(listSyncRunsMock).toHaveBeenCalledTimes(1);

      const bookingsResponse = await fetch(
        `${baseUrl}/api/admin/bookings?rangeStart=2025-01-01&rangeEnd=2025-01-31`,
        { headers: { cookie } }
      );
      expect(bookingsResponse.status).toBe(200);
      const bookingsBody = await bookingsResponse.json();
      expect(bookingsBody.bookings[0].secret_field).toBeUndefined();
      expect(listBookingsMock).toHaveBeenCalledTimes(1);

      const syncResponse = await fetch(`${baseUrl}/api/admin/sync`, { method: "POST", headers: { cookie } });
      expect(syncResponse.status).toBe(202);
      expect(await syncResponse.json()).toMatchObject({ ok: true });
      expect(runSyncJobMock).toHaveBeenCalledTimes(1);
    });
  });
});

