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

