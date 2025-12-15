import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { eventToBooking, parseIcs } from "../src/lib/ical/parse";

function readFixture(relativePath: string): string {
  const fixturePath = fileURLToPath(new URL(relativePath, import.meta.url));
  return readFileSync(fixturePath, "utf8");
}

describe("ical/parse fixtures (integration)", () => {
  it("parses an Airbnb-style all-day reservation and maps to Booking", () => {
    const ics = readFixture("./fixtures/ical/airbnb-sample.ics");
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);

    const booking = eventToBooking(events[0]);
    expect(booking.uid).toBe("airbnb-12345");
    expect(booking.start_date).toBe("2025-12-01T14:00:00.000Z");
    expect(booking.end_date).toBe("2025-12-05T11:00:00.000Z");
  });

  it("parses a Booking.com-style timed event and maps to Booking", () => {
    const ics = readFixture("./fixtures/ical/booking-sample.ics");
    const events = parseIcs(ics);
    expect(events).toHaveLength(1);

    const booking = eventToBooking(events[0]);
    expect(booking.uid).toBe("booking-abc");
    expect(booking.start_date).toBe("2025-12-10T15:00:00.000Z");
    expect(booking.end_date).toBe("2025-12-12T11:00:00.000Z");
  });

  it("fails fast on corrupt ICS content", () => {
    const ics = readFixture("./fixtures/ical/corrupt.ics");
    expect(() => parseIcs(ics)).toThrow();
  });
});

