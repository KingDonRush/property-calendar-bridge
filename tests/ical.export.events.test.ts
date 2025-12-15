import { describe, expect, it } from "vitest";

import { generateCalendar } from "../src/lib/ical/export";
import { parseIcs } from "../src/lib/ical/parse";
import { BookingStatus, type Booking, type Property } from "../src/lib/models/types";

describe("ical/export events", () => {
  it("creates one VEVENT per booking with matching UID and dates", () => {
    const property: Property = { id: "p1", name: "Casa", timezone: "UTC" };
    const bookings: Booking[] = [
      {
        uid: "b1",
        start_date: "2025-12-10T15:00:00.000Z",
        end_date: "2025-12-12T11:00:00.000Z",
        status: BookingStatus.Confirmed
      },
      {
        uid: "b2",
        start_date: "2025-12-15T15:00:00.000Z",
        end_date: "2025-12-16T11:00:00.000Z",
        status: BookingStatus.Confirmed
      }
    ];

    const ics = generateCalendar(bookings, property);
    const events = parseIcs(ics);

    expect(events).toHaveLength(2);
    expect(events.map((e) => e.uid).sort()).toEqual(["b1", "b2"]);
    expect(events[0].start).toBeInstanceOf(Date);
    expect(events[0].end).toBeInstanceOf(Date);
  });
});

