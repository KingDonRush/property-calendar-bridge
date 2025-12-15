import { afterEach, describe, expect, it } from "vitest";

import { getEnv, getIcalMasterSecret, getCronSecretToken } from "../src/lib/env";

describe("lib/env", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("getEnv throws when required env var is missing", () => {
    delete process.env.MISSING_ENV;
    expect(() => getEnv("MISSING_ENV")).toThrow(/Missing required env var/);
  });

  it("getEnv returns the env var when present", () => {
    process.env.SOME_ENV = "ok";
    expect(getEnv("SOME_ENV")).toBe("ok");
  });

  it("getCronSecretToken reads CRON_SECRET_TOKEN", () => {
    process.env.CRON_SECRET_TOKEN = "t";
    expect(getCronSecretToken()).toBe("t");
  });

  it("getIcalMasterSecret reads ICAL_MASTER_SECRET", () => {
    process.env.ICAL_MASTER_SECRET = "s";
    expect(getIcalMasterSecret()).toBe("s");
  });
});

