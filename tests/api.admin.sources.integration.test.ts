import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sourcesState: any[] = [];

const getAllSourcesMock = vi.fn(async () => sourcesState);
const createSourceMock = vi.fn(async (payload: any) => {
  const created = { id: "s1", ...payload };
  sourcesState.push(created);
  return created;
});
const updateSourceStatusMock = vi.fn(async (_id: string, patch: any) => [{ id: "s1", ...patch }]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: (...args: any[]) => getAllSourcesMock(...args),
    createSource: (...args: any[]) => createSourceMock(...args),
    updateSourceStatus: (...args: any[]) => updateSourceStatusMock(...args),
  };
});

const fetchAndParseIcsMock = vi.fn(async () => [{ uid: "u1" }, { uid: "u2" }, { uid: "u3" }]);
vi.mock("../src/lib/ical/sync", () => {
  return {
    fetchAndParseIcs: (...args: any[]) => fetchAndParseIcsMock(...args),
  };
});

function setRequiredEnv(): void {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_KEY = "key";
  process.env.ICAL_MASTER_SECRET = "ical";
  process.env.CRON_SECRET_TOKEN = "token";
  process.env.ADMIN_UI_TOKEN = "admin";
}

describe("integration: api/admin/sources endpoints", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    sourcesState.splice(0, sourcesState.length);
    getAllSourcesMock.mockClear();
    createSourceMock.mockClear();
    updateSourceStatusMock.mockClear();
    fetchAndParseIcsMock.mockClear();
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

  it("rejects all endpoints without admin session", async () => {
    await withServer(async (baseUrl) => {
      const listResponse = await fetch(`${baseUrl}/api/admin/sources`);
      expect(listResponse.status).toBe(401);

      const createResponse = await fetch(`${baseUrl}/api/admin/sources`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ property_id: "p1", source_url: "https://example.com/feed.ics" }),
      });
      expect(createResponse.status).toBe(401);

      const updateResponse = await fetch(`${baseUrl}/api/admin/sources/s1`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source_name: "Airbnb", refresh_rate: 30 }),
      });
      expect(updateResponse.status).toBe(401);

      const deleteResponse = await fetch(`${baseUrl}/api/admin/sources/s1`, { method: "DELETE" });
      expect(deleteResponse.status).toBe(401);

      const testOnlyResponse = await fetch(`${baseUrl}/api/admin/sources/test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: "https://example.com/feed.ics" }),
      });
      expect(testOnlyResponse.status).toBe(401);
    });
  });

  it("supports CRUD flow and test-only endpoint when authenticated", async () => {
    await withServer(async (baseUrl) => {
      const cookie = await loginAndGetCookie(baseUrl);

      const createResponse = await fetch(`${baseUrl}/api/admin/sources`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({
          property_id: "p1",
          source_url: "https://example.com/feed.ics",
          source_name: "Airbnb",
        }),
      });
      expect(createResponse.status).toBe(201);
      const createBody = await createResponse.json();
      expect(createBody).toMatchObject({ source: { id: "s1", property_id: "p1" } });
      expect(createSourceMock).toHaveBeenCalledTimes(1);

      const listResponse = await fetch(`${baseUrl}/api/admin/sources`, { headers: { cookie } });
      expect(listResponse.status).toBe(200);
      const listBody = await listResponse.json();
      expect(listBody).toMatchObject({ sources: [{ id: "s1" }] });
      expect(getAllSourcesMock).toHaveBeenCalledTimes(1);

      const updateResponse = await fetch(`${baseUrl}/api/admin/sources/s1`, {
        method: "PUT",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ source_name: "Airbnb", refresh_rate: 30 }),
      });
      expect(updateResponse.status).toBe(200);
      expect(updateSourceStatusMock).toHaveBeenCalledWith("s1", { source_name: "Airbnb", refresh_rate: 30 });

      const deleteResponse = await fetch(`${baseUrl}/api/admin/sources/s1`, {
        method: "DELETE",
        headers: { cookie },
      });
      expect(deleteResponse.status).toBe(204);
      expect(updateSourceStatusMock).toHaveBeenCalledWith("s1", { refresh_rate: 0 });

      const testOnlyResponse = await fetch(`${baseUrl}/api/admin/sources/test`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ url: "https://example.com/feed.ics" }),
      });

      expect(testOnlyResponse.status).toBe(200);
      expect(await testOnlyResponse.json()).toEqual({ valid: true, eventCount: 3 });
      expect(fetchAndParseIcsMock).toHaveBeenCalled();
    });
  });
});

