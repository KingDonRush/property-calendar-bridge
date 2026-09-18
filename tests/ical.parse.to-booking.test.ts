import { describe, expect, it } from "vitest";

import { BookingStatus } from "../src/lib/models/types";
import { eventToBooking } from "../src/lib/ical/parse";

describe("ical/parse eventToBooking", () => {
  it("maps parsed event to Booking with UTC ISO strings", () => {
    const booking = eventToBooking({
      uid: "evt-1",
      start: new Date("2025-01-01T00:00:00-03:00"),
      end: new Date("2025-01-02T00:00:00-03:00"),
      allDay: false
    });

    expect(booking.uid).toBe("evt-1");
    expect(booking.start_date).toBe("2025-01-01T03:00:00.000Z");
    expect(booking.end_date).toBe("2025-01-02T03:00:00.000Z");
    expect(booking.status).toBe(BookingStatus.Confirmed);
  });

  it("applies all-day normalization when mapping", () => {
    const booking = eventToBooking({
      uid: "evt-2",
      start: new Date("2025-01-02T00:00:00.000Z"),
      end: new Date("2025-01-03T00:00:00.000Z"),
      allDay: true
    });

    expect(booking.start_date).toBe("2025-01-02T14:00:00.000Z");
    expect(booking.end_date).toBe("2025-01-03T11:00:00.000Z");
  });
});

