import { describe, expect, it } from "vitest";

import { BookingStatus } from "../src/lib/models/types";
import { ConflictType, detectConflicts } from "../src/lib/core/conflicts";

describe("core/conflicts buffer option", () => {
  it("treats adjacent bookings as conflict when bufferHours > 0", () => {
    const newBooking: any = {
      uid: "new",
      start_date: "2025-01-02T00:00:00.000Z",
      end_date: "2025-01-03T00:00:00.000Z",
      status: BookingStatus.Confirmed
    };

    const existing: any[] = [
      {
        uid: "old",
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-01-02T00:00:00.000Z",
        status: BookingStatus.Confirmed
      }
    ];

    const conflicts = detectConflicts(newBooking, existing, { bufferHours: 1 });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.type).toBe(ConflictType.BufferViolation);
  });
});

