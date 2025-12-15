import { describe, expect, it } from "vitest";

import { generateCalendar } from "../src/lib/ical/export";
import { parseIcs } from "../src/lib/ical/parse";
import { BookingStatus, type Property } from "../src/lib/models/types";

describe("ical/export privacy", () => {
  it("does not leak guest PII and uses generic summary", () => {
    const property: Property = { id: "p1", name: "Casa", timezone: "UTC" };
    const bookings = [
      {
        uid: "b1",
        start_date: "2025-12-10T15:00:00.000Z",
        end_date: "2025-12-12T11:00:00.000Z",
        status: BookingStatus.Confirmed,
        guest_name: "John Doe",
        guest_email: "john@example.com"
      } as any
    ];

    const ics = generateCalendar(bookings as any, property);
    expect(ics).not.toContain("John Doe");
    expect(ics).not.toContain("john@example.com");

    const [event] = parseIcs(ics);
    expect(event?.summary).toBe("Reservado");
  });
});

