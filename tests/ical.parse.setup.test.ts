import { describe, expect, it } from "vitest";

import { parseIcs } from "../src/lib/ical/parse";

describe("ical/parse setup", () => {
  it("exports parseIcs()", () => {
    expect(typeof parseIcs).toBe("function");
  });

  it("returns [] for empty input", () => {
    expect(parseIcs("")).toEqual([]);
  });
});

