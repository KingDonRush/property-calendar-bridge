import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/jobs/sync", () => ({
  runSyncJob: vi.fn(async () => ({ ok: true, runId: "run_1" })),
}));

import { runSyncJob } from "../src/lib/jobs/sync";

describe("api/jobs/sync", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
    vi.clearAllMocks();
  });

  it("returns 401 when missing bearer token", async () => {
    process.env.CRON_SECRET_TOKEN = "token";
    const { POST } = await import("../src/app/api/jobs/sync/route");

    const response = await POST(new Request("http://localhost/api/jobs/sync", { method: "POST" }));
    expect(response.status).toBe(401);
  });

  it("triggers sync when bearer token is valid", async () => {
    process.env.CRON_SECRET_TOKEN = "token";
    const { POST } = await import("../src/app/api/jobs/sync/route");

    const response = await POST(
      new Request("http://localhost/api/jobs/sync", {
        method: "POST",
        headers: { authorization: "Bearer token" },
      })
    );

    expect(runSyncJob).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.runId).toBe("run_1");
  });
});

