import { describe, expect, it, vi } from "vitest";

import { fetchAndParseIcs } from "../src/lib/ical/sync";

describe("ical/sync fetch+parse", () => {
  it("fetches an ICS URL and returns parsed VEVENTs", async () => {
    const fetchFn = vi.fn(async () => new Response("BEGIN:VCALENDAR\nEND:VCALENDAR", { status: 200 }));

    const events = await fetchAndParseIcs("https://example.com/calendar.ics", { fetchFn });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(Array.isArray(events)).toBe(true);
  });

  it("throws on non-2xx responses", async () => {
    const fetchFn = vi.fn(async () => new Response("nope", { status: 500, statusText: "Server Error" }));

    await expect(fetchAndParseIcs("https://example.com/calendar.ics", { fetchFn })).rejects.toThrow(/500/);
  });

  it("times out and aborts the request", async () => {
    vi.useFakeTimers();

    const fetchFn = vi.fn((_url: string, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        if (!signal) return reject(new Error("missing signal"));
        signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
    });

    const promise = fetchAndParseIcs("https://example.com/calendar.ics", { fetchFn, timeoutMs: 5 });
    const assertion = expect(promise).rejects.toThrow(/timeout/i);
    await vi.advanceTimersByTimeAsync(10);
    await assertion;

    vi.useRealTimers();
  });
});
