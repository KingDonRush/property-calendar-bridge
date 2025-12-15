import { describe, expect, it } from "vitest";

import { generateCalendar } from "../src/lib/ical/export";
import { parseIcs } from "../src/lib/ical/parse";
import { BookingStatus, type Property } from "../src/lib/models/types";

describe("ical/export stable UIDs", () => {
  it("prefers external UID when present on the booking", () => {
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

    const [event] = parseIcs(generateCalendar(bookings as any, property));
    expect(event?.uid).toBe("ext-1");

    const [event2] = parseIcs(generateCalendar(bookings as any, property));
    expect(event2?.uid).toBe("ext-1");
  });
});

