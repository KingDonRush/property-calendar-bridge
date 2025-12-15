import type { Booking } from "../models/types";

export const ConflictSeverity = {
  Warning: "warning",
  Critical: "critical"
} as const;

export type ConflictSeverity = (typeof ConflictSeverity)[keyof typeof ConflictSeverity];

export const ConflictType = {
  Overlap: "overlap",
  Adjacent: "adjacent",
  Double: "double"
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
