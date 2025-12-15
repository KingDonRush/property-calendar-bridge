import type { Booking } from "../models/types";

export const ConflictSeverity = {
  Warning: "warning",
  Critical: "critical"
} as const;

export type ConflictSeverity = (typeof ConflictSeverity)[keyof typeof ConflictSeverity];

export const ConflictType = {
  Overlap: "overlap",
  Adjacent: "adjacent",
  Double: "double",
  BufferViolation: "buffer_violation"
} as const;

export type ConflictType = (typeof ConflictType)[keyof typeof ConflictType];

export type Conflict = {
  type: ConflictType;
  severity: ConflictSeverity;
  booking: Booking;
  conflictingBooking: Booking;
};

function assertValidDate(value: unknown): asserts value is Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error("Invalid Date");
  }
}

export function checkDateOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  assertValidDate(startA);
  assertValidDate(endA);
  assertValidDate(startB);
  assertValidDate(endB);

  const aStart = startA.getTime();
  const aEnd = endA.getTime();
  const bStart = startB.getTime();
  const bEnd = endB.getTime();

  if (!(aEnd > aStart) || !(bEnd > bStart)) return false;

  return aStart < bEnd && bStart < aEnd;
}

function parseBookingRange(booking: Booking): { start: Date; end: Date } | null {
  const start = new Date(booking.start_date);
  const end = new Date(booking.end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

export type DetectConflictsOptions = {
  bufferHours?: number;
};

function overlapsWithBuffer(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
  bufferHours: number
): boolean {
  const bufferMs = Math.max(0, bufferHours) * 60 * 60 * 1000;
  const aStart = startA.getTime();
  const aEnd = endA.getTime() + bufferMs;
  const bStart = startB.getTime();
  const bEnd = endB.getTime() + bufferMs;
  return aStart < bEnd && bStart < aEnd;
}

export function detectConflicts(
  newBooking: Booking,
  existingBookings: Booking[],
  options: DetectConflictsOptions = {}
): Conflict[] {
  const newRange = parseBookingRange(newBooking);
  if (!newRange) return [];

  const conflicts: Conflict[] = [];
  const bufferHours = options.bufferHours ?? 0;
  for (const existing of existingBookings) {
    const existingRange = parseBookingRange(existing);
    if (!existingRange) continue;

    const overlaps =
      bufferHours > 0
        ? overlapsWithBuffer(newRange.start, newRange.end, existingRange.start, existingRange.end, bufferHours)
        : checkDateOverlap(newRange.start, newRange.end, existingRange.start, existingRange.end);

    if (overlaps) {
      const isExternal =
        (newBooking as any).source !== undefined &&
        (newBooking as any).source !== "manual" &&
        (newBooking as any).source !== "internal";
      const existingIsExternal =
        (existing as any).source !== undefined &&
        (existing as any).source !== "manual" &&
        (existing as any).source !== "internal";
      const severity = isExternal || existingIsExternal ? ConflictSeverity.Critical : ConflictSeverity.Warning;

      conflicts.push({
        type: bufferHours > 0 ? ConflictType.BufferViolation : ConflictType.Overlap,
        severity,
        booking: newBooking,
        conflictingBooking: existing
      });
    }
  }
  return conflicts;
}
