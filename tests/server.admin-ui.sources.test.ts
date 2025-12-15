import { afterEach, describe, expect, it, vi } from "vitest";

const getAllSourcesMock = vi.fn(async () => [
  { id: "s1", source_name: "Airbnb" },
  { id: "s2", source_name: "Booking" },
]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: (...args: any[]) => getAllSourcesMock(...args),
  };
});

describe("server admin UI: /admin/sources", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  function setRequiredEnv(): void {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";
  }

  it("serves /admin/sources after login and shows the sources count", async () => {
    setRequiredEnv();
    vi.resetModules();

    const { createHttpServer } = await import("../src/httpServer");
    const server = createHttpServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    try {
      const loginPostResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
        method: "POST",
        redirect: "manual",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "token=admin",
      });

      expect(loginPostResponse.status).toBe(302);
      const setCookie = loginPostResponse.headers.get("set-cookie");
      expect(setCookie).toContain("admin_session=");

      const sourcesResponse = await fetch(`http://localhost:${port}/admin/sources`, {
        headers: { cookie: setCookie ?? "" },
      });

      expect(sourcesResponse.status).toBe(200);
      const html = await sourcesResponse.text();
      expect(html).toContain("Fontes");
      expect(html).toContain("Total: 2");
      expect(getAllSourcesMock).toHaveBeenCalledTimes(1);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

