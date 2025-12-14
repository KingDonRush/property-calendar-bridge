import { describe, expect, it } from "vitest";

import { toUtcISOString } from "../src/lib/models/time";

describe("models/time", () => {
  it("normalizes ISO strings with offset to UTC ISO string", () => {
    expect(toUtcISOString("2025-01-01T00:00:00-03:00")).toBe(
      "2025-01-01T03:00:00.000Z"
    );
  });

  it("normalizes date-only strings to UTC midnight", () => {
    expect(toUtcISOString("2025-01-01")).toBe("2025-01-01T00:00:00.000Z");
  });

  it("accepts Date input", () => {
    const date = new Date("2025-01-01T00:00:00.000Z");
    expect(toUtcISOString(date)).toBe("2025-01-01T00:00:00.000Z");
  });

  it("throws on invalid date input", () => {
    expect(() => toUtcISOString("not-a-date")).toThrow();
  });
});

