import { beforeEach, describe, expect, it, vi } from "vitest";

type AnyRecord = Record<string, any>;

function makeThenable<T>(value: T) {
  return {
    then: (onFulfilled: (v: T) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(value).then(onFulfilled, onRejected)
  };
}

function createFromMock() {
  const state = {
    sources: [] as AnyRecord[],
    bookings: [] as AnyRecord[]
  };

  const from = vi.fn((table: string) => {
    const builder: any = {
      select: vi.fn(() => builder),
      gte: vi.fn(() => builder),
      lte: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      insert: vi.fn((payload: AnyRecord) => {
        if (table === "channel_sources") state.sources.push(payload);
        return makeThenable({ data: [payload], error: null });
      }),
      upsert: vi.fn((payload: AnyRecord) => {
        if (table === "bookings") state.bookings.push(payload);
        return makeThenable({ data: [payload], error: null });
      })
    };

    // make `await builder` work for select() chain
    (builder as any).then = (onFulfilled: any, onRejected: any) => {
      if (table === "bookings") return Promise.resolve({ data: state.bookings, error: null }).then(onFulfilled, onRejected);
      if (table === "channel_sources") return Promise.resolve({ data: state.sources, error: null }).then(onFulfilled, onRejected);
      return Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected);
    };

    return builder;
  });

  return { from, state };
}

describe("data/repositories integration (3.5)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates source -> upserts booking -> lists bookings", async () => {
    const { from, state } = createFromMock();

    vi.doMock("../src/lib/data/supabase", () => {
      return { getSupabaseClient: () => ({ from }) };
    });

    const repos = await import("../src/lib/data/repositories");

    expect(repos).toHaveProperty("listBookings");
    expect(repos).toHaveProperty("upsertBooking");
    expect(repos).toHaveProperty("getAllSources");
    expect(repos).toHaveProperty("createSource");

    await repos.createSource({
      id: "s1",
      property_id: "p1",
      url: "https://example.com/a.ics",
      type: "ical"
    });

    await repos.upsertBooking({ id: "b1", property_id: "p1" } as any);

    const bookings = await repos.listBookings({ rangeStart: "2025-01-01", rangeEnd: "2025-01-31" });

    expect(state.sources.length).toBe(1);
    expect(state.bookings.length).toBe(1);
    expect(bookings).toHaveLength(1);
  });
});

