import { describe, expect, it } from "vitest";

import { requireJobsAuth } from "../src/lib/api/auth";

describe("lib/api/auth requireJobsAuth", () => {
  it("returns 401 response when Authorization is missing", () => {
    const response = requireJobsAuth(new Request("http://localhost/api/jobs/sync"), "token");
    expect(response?.status).toBe(401);
  });

  it("returns null when Authorization Bearer token matches", () => {
    const request = new Request("http://localhost/api/jobs/sync", {
      headers: { authorization: "Bearer token" },
    });
    expect(requireJobsAuth(request, "token")).toBeNull();
  });

  it("accepts token via query param", () => {
    const request = new Request("http://localhost/api/jobs/sync?token=token");
    expect(requireJobsAuth(request, "token")).toBeNull();
  });
});

