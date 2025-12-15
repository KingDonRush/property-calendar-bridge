import nodeIcal, { type ParsedIcsComponent } from "node-ical";

import { normalizeDateRange, toUtcISOString } from "../models/time";
import { BookingStatus, type Booking } from "../models/types";

export type ParsedIcsEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary?: string;
  description?: string;
  allDay: boolean;
};

export type NormalizedEventDateRange = {
  startUtc: string;
  endUtc: string;
};

export class IcsParseError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "IcsParseError";
    this.cause = cause;
  }
}

function assertValidDate(date: Date): void {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date");
  }
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function isMidnight(hours: number, minutes: number, seconds: number, milliseconds: number): boolean {
  return hours === 0 && minutes === 0 && seconds === 0 && milliseconds === 0;
}

function toInferredDateOnlyString(date: Date): string {
  const localMidnight = isMidnight(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
  const utcMidnight = isMidnight(date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());

  const useLocal = localMidnight && !utcMidnight;
  const year = useLocal ? date.getFullYear() : date.getUTCFullYear();
  const month = useLocal ? date.getMonth() + 1 : date.getUTCMonth() + 1;
  const day = useLocal ? date.getDate() : date.getUTCDate();

  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function normalizeEventDateRange(event: Pick<ParsedIcsEvent, "start" | "end" | "allDay">): NormalizedEventDateRange {
  assertValidDate(event.start);
  assertValidDate(event.end);

  if (event.allDay) {
    const startDateOnly = toInferredDateOnlyString(event.start);
    const endDateOnly = toInferredDateOnlyString(event.end);
    const { start, end } = normalizeDateRange(startDateOnly, endDateOnly, true);
    return { startUtc: start, endUtc: end };
  }

  return { startUtc: toUtcISOString(event.start), endUtc: toUtcISOString(event.end) };
}

export function eventToBooking(event: Pick<ParsedIcsEvent, "uid" | "start" | "end" | "allDay">): Booking {
  const { startUtc, endUtc } = normalizeEventDateRange(event);
  return {
    uid: event.uid,
    start_date: startUtc,
    end_date: endUtc,
    status: BookingStatus.Confirmed
  };
}

export function parseIcs(ics: string): ParsedIcsEvent[] {
  const trimmed = ics.trim();
  if (!trimmed) return [];

  if (!trimmed.includes("BEGIN:VCALENDAR")) {
    throw new IcsParseError("Invalid ICS content");
  }

  let parsed: Record<string, ParsedIcsComponent>;
  try {
    parsed = nodeIcal.parseICS(trimmed);
  } catch (error) {
    throw new IcsParseError("Invalid ICS content", error);
  }
  const events: ParsedIcsEvent[] = [];

  for (const component of Object.values(parsed)) {
    if (component?.type !== "VEVENT") continue;

    const uid = String((component as any).uid ?? "");
    const start = (component as any).start instanceof Date ? (component as any).start : null;
    const end = (component as any).end instanceof Date ? (component as any).end : null;
    if (!uid || !start || !end) continue;

    const allDay = (component as any).datetype === "date";
    const summary = typeof (component as any).summary === "string" ? (component as any).summary : undefined;
    const description =
      typeof (component as any).description === "string" ? (component as any).description : undefined;

    events.push({ uid, start, end, summary, description, allDay });
  }

  return events;
}
