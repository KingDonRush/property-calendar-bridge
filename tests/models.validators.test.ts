import { describe, expect, it } from "vitest";

import { BookingStatus, ChannelType } from "../src/lib/models/types";
import { validateBooking, validateChannelSource } from "../src/lib/models/validators";

describe("models/validators", () => {
  it("accepts a valid booking", () => {
    const booking = validateBooking({
      uid: "b1",
      start_date: "2025-01-01T14:00:00.000Z",
      end_date: "2025-01-02T11:00:00.000Z",
      status: BookingStatus.Confirmed
    });

    expect(booking.uid).toBe("b1");
  });

  it("rejects booking with invalid range", () => {
    expect(() =>
      validateBooking({
        uid: "b1",
        start_date: "2025-01-02T11:00:00.000Z",
        end_date: "2025-01-01T14:00:00.000Z",
        status: BookingStatus.Confirmed
      })
    ).toThrow(/end/i);
  });

  it("rejects booking with invalid dates", () => {
    expect(() =>
      validateBooking({
        uid: "b1",
        start_date: "not-a-date",
        end_date: "2025-01-01T14:00:00.000Z",
        status: BookingStatus.Confirmed
      })
    ).toThrow(/date/i);
  });

  it("accepts a valid channel source url", () => {
    const source = validateChannelSource({
      id: "s1",
      property_id: "p1",
      url: "https://example.com/calendar.ics",
      type: ChannelType.ICal
    });

    expect(source.url).toBe("https://example.com/calendar.ics");
  });

  it("rejects a channel source with invalid url", () => {
    expect(() =>
      validateChannelSource({
        id: "s1",
        property_id: "p1",
        url: "not-a-url",
        type: ChannelType.ICal
      })
    ).toThrow(/url/i);
  });
});

