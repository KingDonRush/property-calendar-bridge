import { describe, expect, it } from "vitest";

import { parseIcs } from "../src/lib/ical/parse";

describe("ical/parse VEVENT extraction", () => {
  it("extracts VEVENTs with uid, dates, summary and description", () => {
    const ics = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//test//EN
BEGIN:VEVENT
UID:event-1
DTSTART:20250101T120000Z
DTEND:20250101T130000Z
SUMMARY:Test event
DESCRIPTION:Hello
END:VEVENT
BEGIN:VEVENT
UID:event-2
DTSTART;VALUE=DATE:20250102
DTEND;VALUE=DATE:20250103
SUMMARY:All day
END:VEVENT
END:VCALENDAR
`;

    const events = parseIcs(ics);
    expect(events).toHaveLength(2);
    expect(events[0]?.uid).toBe("event-1");
    expect(events[0]?.summary).toBe("Test event");
    expect((events[0] as any).description).toBe("Hello");
    expect(events[0]?.allDay).toBe(false);

    expect(events[1]?.uid).toBe("event-2");
    expect(events[1]?.allDay).toBe(true);
  });
});

