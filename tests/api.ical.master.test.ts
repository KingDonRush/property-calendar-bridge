import { afterEach, describe, expect, it } from "vitest";

import { GET } from "../src/app/api/ical/[secret]/master.ics/route";

describe("api/ical/[secret]/master.ics", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("returns a calendar when secret matches", async () => {
    process.env.ICAL_MASTER_SECRET = "secret";

    const response = await GET(new Request("http://localhost/api/ical/secret/master.ics"), {
      params: { secret: "secret" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/text\/calendar/i);

    const body = await response.text();
    expect(body).toMatch(/BEGIN:VCALENDAR/);
  });

  it("returns 401 when secret is invalid", async () => {
    process.env.ICAL_MASTER_SECRET = "secret";

    const response = await GET(new Request("http://localhost/api/ical/bad/master.ics"), {
      params: { secret: "bad" },
    });

    expect(response.status).toBe(401);
  });
});

