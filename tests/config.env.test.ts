import { afterEach, describe, expect, it } from "vitest";

import { getConfig } from "../src/lib/config";

describe("lib/config env validation", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("throws when SUPABASE_URL is missing", () => {
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    expect(() => getConfig()).toThrow(/SUPABASE_URL/);
  });

  it("returns config when required env vars are present", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.ICAL_MASTER_SECRET = "ical";
    process.env.CRON_SECRET_TOKEN = "token";
    process.env.ADMIN_UI_TOKEN = "admin";

    expect(getConfig()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseKey: "key",
      icalMasterSecret: "ical",
      cronSecretToken: "token",
      adminUiToken: "admin",
      adminUiSessionSecret: "admin",
    });
  });

  it("supports legacy MASTER_ICS_SECRET and JOBS_TOKEN env var names", () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "key";
    process.env.MASTER_ICS_SECRET = "ical_legacy";
    process.env.JOBS_TOKEN = "token_legacy";
    process.env.ADMIN_UI_TOKEN = "admin";

    expect(getConfig()).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseKey: "key",
      icalMasterSecret: "ical_legacy",
      cronSecretToken: "token_legacy",
      adminUiToken: "admin",
      adminUiSessionSecret: "admin",
    });
  });
});
