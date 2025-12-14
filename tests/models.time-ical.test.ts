import { describe, expect, it } from "vitest";

import { normalizeDateRange } from "../src/lib/models/time";

describe("models/time (iCal rules)", () => {
  it("applies default check-in/out times for date-only inputs", () => {
    const { start, end } = normalizeDateRange("2025-01-01", "2025-01-02", true);
    expect(start).toBe("2025-01-01T14:00:00.000Z");
    expect(end).toBe("2025-01-02T11:00:00.000Z");
  });

  it("does not override explicit times", () => {
    const { start, end } = normalizeDateRange(
      "2025-01-01T16:00:00.000Z",
      "2025-01-02T10:30:00.000Z",
      false
    );
    expect(start).toBe("2025-01-01T16:00:00.000Z");
    expect(end).toBe("2025-01-02T10:30:00.000Z");
  });

  it("throws when end is not after start", () => {
    expect(() =>
      normalizeDateRange("2025-01-02", "2025-01-01", true)
    ).toThrow();
  });
});

