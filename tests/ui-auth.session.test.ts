import { afterEach, describe, expect, it } from "vitest";

import {
  ADMIN_SESSION_COOKIE_NAME,
  clearAdminSessionCookie,
  createAdminSessionCookieValue,
  isValidAdminSessionCookieValue,
  isValidToken,
  setAdminSessionCookie,
} from "../src/lib/ui-auth/session";

describe("lib/ui-auth/session", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("validates the provided admin UI token", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    expect(isValidToken("admin")).toBe(true);
    expect(isValidToken("wrong")).toBe(false);
  });

  it("generates and validates admin session cookie values", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    const value = createAdminSessionCookieValue();
    expect(isValidAdminSessionCookieValue(value)).toBe(true);
    expect(isValidAdminSessionCookieValue(`${value}x`)).toBe(false);
  });

  it("sets the admin session cookie as HttpOnly with SameSite=Strict", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    const headers = new Headers();
    setAdminSessionCookie(headers);

    const setCookie = headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${ADMIN_SESSION_COOKIE_NAME}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Strict");
    expect(setCookie).toContain("Path=/");
  });

  it("clears the admin session cookie by setting Max-Age=0", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    const headers = new Headers();
    clearAdminSessionCookie(headers);

    const setCookie = headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${ADMIN_SESSION_COOKIE_NAME}=`);
    expect(setCookie).toContain("Max-Age=0");
  });
});

