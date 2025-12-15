import { describe, expect, it } from "vitest";

import { normalizeEventDateRange } from "../src/lib/ical/parse";

describe("ical/parse date normalization", () => {
  it("normalizes timed events to UTC ISO strings", () => {
    const { startUtc, endUtc } = normalizeEventDateRange({
      uid: "e1",
      start: new Date("2025-01-01T00:00:00-03:00"),
      end: new Date("2025-01-01T01:00:00-03:00"),
      allDay: false
    });
    expect(startUtc).toBe("2025-01-01T03:00:00.000Z");
    expect(endUtc).toBe("2025-01-01T04:00:00.000Z");
  });

  it("normalizes all-day events using default check-in/out times", () => {
    const { startUtc, endUtc } = normalizeEventDateRange({
      uid: "e2",
      start: new Date("2025-01-02T00:00:00.000Z"),
      end: new Date("2025-01-03T00:00:00.000Z"),
      allDay: true
    });
    expect(startUtc).toBe("2025-01-02T14:00:00.000Z");
    expect(endUtc).toBe("2025-01-03T11:00:00.000Z");
  });

  it("throws on invalid dates", () => {
    expect(() =>
      normalizeEventDateRange({
        uid: "e3",
        start: new Date("invalid"),
        end: new Date("2025-01-01T00:00:00.000Z"),
        allDay: false
      })
    ).toThrow();
  });
});

