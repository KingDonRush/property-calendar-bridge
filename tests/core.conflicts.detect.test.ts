import { describe, expect, it } from "vitest";

import { BookingStatus } from "../src/lib/models/types";
import { ConflictType, detectConflicts } from "../src/lib/core/conflicts";

describe("core/conflicts detectConflicts", () => {
  it("returns no conflicts when ranges are adjacent", () => {
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

    expect(detectConflicts(newBooking, existing)).toEqual([]);
  });

  it("returns conflicts for overlapping bookings", () => {
    const newBooking: any = {
      uid: "new",
      start_date: "2025-01-02T00:00:00.000Z",
      end_date: "2025-01-04T00:00:00.000Z",
      status: BookingStatus.Confirmed
    };

    const existing: any[] = [
      {
        uid: "old",
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-01-03T00:00:00.000Z",
        status: BookingStatus.Confirmed
      }
    ];

    const conflicts = detectConflicts(newBooking, existing);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]?.type).toBe(ConflictType.Overlap);
  });
});

