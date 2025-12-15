import { afterEach, describe, expect, it } from "vitest";

import { createHttpServer } from "../src/httpServer";

describe("server admin UI routing", () => {
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

  it("serves /login and protects /admin (redirects without session)", async () => {
    setRequiredEnv();

    const server = createHttpServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    try {
      const loginResponse = await fetch(`http://localhost:${port}/login`);
      expect(loginResponse.status).toBe(200);
      expect(await loginResponse.text()).toContain('action="/api/auth/login"');

      const adminResponse = await fetch(`http://localhost:${port}/admin`, { redirect: "manual" });
      expect(adminResponse.status).toBe(302);
      expect(adminResponse.headers.get("location")).toBe(`http://localhost:${port}/login`);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("allows login and then access to /admin with the session cookie", async () => {
    setRequiredEnv();

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

      const adminResponse = await fetch(`http://localhost:${port}/admin`, {
        headers: { cookie: setCookie ?? "" },
      });

      expect(adminResponse.status).toBe(200);
      expect(await adminResponse.text()).toContain("Admin");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
