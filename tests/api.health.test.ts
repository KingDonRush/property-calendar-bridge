import { describe, expect, it } from "vitest";

import { GET } from "../src/app/api/health/route";

describe("api/health", () => {
  it("returns ok JSON and disables caching", async () => {
    const response = await GET(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/application\/json/i);
    expect(response.headers.get("cache-control")).toMatch(/no-store/i);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });
});

