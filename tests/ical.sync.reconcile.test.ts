import { describe, expect, it } from "vitest";

import { bookingHash, reconcileExternalBooking } from "../src/lib/ical/sync";
import { BookingStatus } from "../src/lib/models/types";

describe("ical/sync reconciliation (source of truth)", () => {
  it("does not overwrite a local manual block without explicit mapping", () => {
    const incoming = {
      uid: "ext-1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      status: BookingStatus.Confirmed
    };

    const decision = reconcileExternalBooking({
      incoming,
      existingBooking: {
        ...incoming,
        status: BookingStatus.Blocked
      },
      existingMapping: null
    });

    expect(decision.action).toBe("skip");
    if (decision.action === "skip") {
      expect(decision.reason).toBe("protected_local");
    }
  });

  it("updates when mapping explicitly links external UID to local booking", () => {
    const incoming = {
      uid: "ext-1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      status: BookingStatus.Confirmed
    };

    const decision = reconcileExternalBooking({
      incoming,
      existingBooking: { ...incoming, status: BookingStatus.Blocked },
      existingMapping: { bookingUid: "local-1", lastHash: "old" }
    });

    expect(decision).toEqual({
      action: "update",
      bookingUid: "local-1",
      booking: incoming
    });
  });

  it("skips when incoming hash matches the last synced hash", () => {
    const incoming = {
      uid: "ext-1",
      start_date: "2025-01-01T00:00:00.000Z",
      end_date: "2025-01-02T00:00:00.000Z",
      status: BookingStatus.Confirmed
    };

    const decision = reconcileExternalBooking({
      incoming,
      existingBooking: incoming,
      existingMapping: { bookingUid: "local-1", lastHash: bookingHash(incoming) }
    });

    expect(decision.action).toBe("skip");
    if (decision.action === "skip") {
      expect(decision.reason).toBe("no_change");
    }
  });
});

