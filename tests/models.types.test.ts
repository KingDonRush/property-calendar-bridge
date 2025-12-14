import { describe, expect, it } from "vitest";

import { BookingStatus, ChannelType } from "../src/lib/models/types";

describe("models/types", () => {
  it("exposes ChannelType enum values", () => {
    expect(ChannelType.ICal).toBe("ical");
    expect(ChannelType.Airbnb).toBe("airbnb");
    expect(ChannelType.Booking).toBe("booking");
  });

  it("exposes BookingStatus enum values", () => {
    expect(BookingStatus.Confirmed).toBe("confirmed");
    expect(BookingStatus.Cancelled).toBe("cancelled");
    expect(BookingStatus.Tentative).toBe("tentative");
    expect(BookingStatus.Blocked).toBe("blocked");
  });
});

