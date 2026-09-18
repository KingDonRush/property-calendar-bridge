vi.mock("../src/lib/data/repositories", () => ({ getAllBookings: async () => [
  { id: "booking-123", start_date: "2026-01-01", end_date: "2026-01-03", status: "confirmed" }
] }));
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../src/app/api/ical/[secret]/master.ics/route";

describe("api/ical/[secret]/master.ics", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("returns a calendar when secret matches", async () => {
    process.env.ICAL_MASTER_SECRET = "secret";

    const response = await GET(new Request("http://localhost/api/ical/secret/master.ics"), {
      params: Promise.resolve({ secret: "secret" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/text\/calendar/i);

    const body = await response.text();
    expect(body).toMatch(/BEGIN:VCALENDAR/);
    expect(body).toContain("UID:booking-123");
    expect(body).toContain("BEGIN:VEVENT");
  });

  it("returns 401 when secret is invalid", async () => {
    process.env.ICAL_MASTER_SECRET = "secret";

    const response = await GET(new Request("http://localhost/api/ical/bad/master.ics"), {
      params: Promise.resolve({ secret: "bad" }),
    });

    expect(response.status).toBe(401);
  });
});

