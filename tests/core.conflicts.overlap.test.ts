import { describe, expect, it } from "vitest";

import { checkDateOverlap } from "../src/lib/core/conflicts";

describe("core/conflicts checkDateOverlap", () => {
  it("returns false for disjoint ranges", () => {
    const aStart = new Date("2025-01-01T00:00:00.000Z");
    const aEnd = new Date("2025-01-02T00:00:00.000Z");
    const bStart = new Date("2025-01-03T00:00:00.000Z");
    const bEnd = new Date("2025-01-04T00:00:00.000Z");
    expect(checkDateOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });

  it("returns false for touching edges (DTEND exclusive)", () => {
    const aStart = new Date("2025-01-01T00:00:00.000Z");
    const aEnd = new Date("2025-01-02T00:00:00.000Z");
    const bStart = new Date("2025-01-02T00:00:00.000Z");
    const bEnd = new Date("2025-01-03T00:00:00.000Z");
    expect(checkDateOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });

  it("returns true for partial overlap", () => {
    const aStart = new Date("2025-01-01T00:00:00.000Z");
    const aEnd = new Date("2025-01-03T00:00:00.000Z");
    const bStart = new Date("2025-01-02T00:00:00.000Z");
    const bEnd = new Date("2025-01-04T00:00:00.000Z");
    expect(checkDateOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
  });

  it("returns true for total overlap (A inside B)", () => {
    const aStart = new Date("2025-01-02T00:00:00.000Z");
    const aEnd = new Date("2025-01-03T00:00:00.000Z");
    const bStart = new Date("2025-01-01T00:00:00.000Z");
    const bEnd = new Date("2025-01-04T00:00:00.000Z");
    expect(checkDateOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
  });
});

