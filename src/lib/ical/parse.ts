import { parseICS } from "node-ical";

import { normalizeDateRange, toUtcISOString } from "../models/time";

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

function assertValidDate(date: Date): void {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date");
  }
}

function toUtcDateOnlyString(date: Date): string {
  return toUtcISOString(date).slice(0, 10);
}

export function normalizeEventDateRange(event: Pick<ParsedIcsEvent, "start" | "end" | "allDay">): NormalizedEventDateRange {
  assertValidDate(event.start);
  assertValidDate(event.end);

  if (event.allDay) {
    const startDateOnly = toUtcDateOnlyString(event.start);
    const endDateOnly = toUtcDateOnlyString(event.end);
    const { start, end } = normalizeDateRange(startDateOnly, endDateOnly, true);
    return { startUtc: start, endUtc: end };
  }

  return { startUtc: toUtcISOString(event.start), endUtc: toUtcISOString(event.end) };
}

export function parseIcs(ics: string): ParsedIcsEvent[] {
  const trimmed = ics.trim();
  if (!trimmed) return [];

  const parsed = parseICS(trimmed);
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
