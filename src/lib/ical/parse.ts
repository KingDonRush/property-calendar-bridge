import { parseICS } from "node-ical";

export type ParsedIcsEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary?: string;
  allDay: boolean;
};

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

    events.push({ uid, start, end, summary, allDay });
  }

  return events;
}

