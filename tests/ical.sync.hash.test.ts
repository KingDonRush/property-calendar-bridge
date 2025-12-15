import { describe, expect, it } from "vitest";

import { BookingStatus } from "../src/lib/models/types";
import { bookingHash } from "../src/lib/ical/sync";

describe("ical/sync booking hash", () => {
  it("is stable for identical bookings", () => {
    const a = bookingHash({
      uid: "u1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      status: BookingStatus.Confirmed
    });
    const b = bookingHash({
      uid: "u1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      status: BookingStatus.Confirmed
    });

    expect(a).toBe(b);
  });

  it("changes when booking data changes", () => {
    const base = {
      uid: "u1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      status: BookingStatus.Confirmed
    };

    expect(bookingHash(base)).not.toBe(
      bookingHash({
        ...base,
        start_date: "2025-01-01T01:00:00.000Z"
      })
    );
  });
});

