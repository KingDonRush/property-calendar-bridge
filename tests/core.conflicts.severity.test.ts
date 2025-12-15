import { describe, expect, it } from "vitest";

import { BookingStatus } from "../src/lib/models/types";
import { ConflictSeverity, detectConflicts } from "../src/lib/core/conflicts";

describe("core/conflicts severity", () => {
  it("marks conflict as critical if any booking is external", () => {
    const newBooking: any = {
      uid: "new",
      start_date: "2025-01-02T00:00:00.000Z",
      end_date: "2025-01-04T00:00:00.000Z",
      status: BookingStatus.Confirmed,
      source: "manual"
    };

    const existing: any[] = [
      {
        uid: "ext",
        start_date: "2025-01-03T00:00:00.000Z",
        end_date: "2025-01-05T00:00:00.000Z",
        status: BookingStatus.Confirmed,
        source: "airbnb"
      }
    ];

    const conflicts = detectConflicts(newBooking, existing);
    expect(conflicts[0]?.severity).toBe(ConflictSeverity.Critical);
  });

  it("marks conflict as warning if both are internal", () => {
    const newBooking: any = {
      uid: "new",
      start_date: "2025-01-02T00:00:00.000Z",
      end_date: "2025-01-04T00:00:00.000Z",
      status: BookingStatus.Confirmed,
      source: "manual"
    };

    const existing: any[] = [
      {
        uid: "old",
        start_date: "2025-01-03T00:00:00.000Z",
        end_date: "2025-01-05T00:00:00.000Z",
        status: BookingStatus.Confirmed,
        source: "manual"
      }
    ];

    const conflicts = detectConflicts(newBooking, existing);
    expect(conflicts[0]?.severity).toBe(ConflictSeverity.Warning);
  });
});

