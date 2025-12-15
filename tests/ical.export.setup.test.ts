import { describe, expect, it } from "vitest";

import { generateCalendar } from "../src/lib/ical/export";
import type { Property } from "../src/lib/models/types";

describe("ical/export setup", () => {
  it("generates a base VCALENDAR string", () => {
    const property: Property = { id: "p1", name: "Casa", timezone: "UTC" };
    const ics = generateCalendar([], property);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
  });
});

