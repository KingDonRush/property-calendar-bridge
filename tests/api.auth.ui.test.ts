import { afterEach, describe, expect, it } from "vitest";

import { POST as loginPost } from "../src/app/api/auth/login/route";
import { POST as logoutPost } from "../src/app/api/auth/logout/route";

describe("api/auth login + logout", () => {
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

  it("sets admin session cookie and redirects on successful login", async () => {
    setRequiredEnv();

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "token=admin",
    });

    const response = await loginPost(request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost/admin");
    expect(response.headers.get("set-cookie") ?? "").toContain("admin_session=");
  });

  it("returns 401 with HTML when login token is invalid", async () => {
    setRequiredEnv();

    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "token=wrong",
    });

    const response = await loginPost(request);
    expect(response.status).toBe(401);
    expect(await response.text()).toContain("Token inválido");
  });

  it("clears cookie and redirects on logout", async () => {
    setRequiredEnv();

    const request = new Request("http://localhost/api/auth/logout", { method: "POST" });
    const response = await logoutPost(request);
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.headers.get("set-cookie") ?? "").toContain("Max-Age=0");
  });
});

