import { describe, expect, it } from "vitest";

import { generateCalendar } from "../src/lib/ical/export";
import { eventToBooking, parseIcs } from "../src/lib/ical/parse";
import { BookingStatus, type Property } from "../src/lib/models/types";

describe("ical/export round-trip", () => {
  it("generates RFC-like calendar and round-trips via parser", () => {
    const property: Property = { id: "p1", name: "Casa", timezone: "UTC" };
    const bookings = [
      {
        uid: "internal-1",
        external_uid: "ext-1",
        start_date: "2025-12-10T15:00:00.000Z",
        end_date: "2025-12-12T11:00:00.000Z",
        status: BookingStatus.Confirmed
      } as any
    ];

    const ics = generateCalendar(bookings as any, property);
    expect(ics).toContain("PRODID:-//simplePropertyManager//simplePropertyManager//EN");

    const events = parseIcs(ics);
    expect(events).toHaveLength(1);

    const roundTrip = eventToBooking(events[0]);
    expect(roundTrip.uid).toBe("ext-1");
    expect(roundTrip.start_date).toBe("2025-12-10T15:00:00.000Z");
    expect(roundTrip.end_date).toBe("2025-12-12T11:00:00.000Z");
  });
});

