import { beforeEach, describe, expect, it, vi } from "vitest";

const querySelectMock = vi.fn();
const queryGteMock = vi.fn();
const queryLteMock = vi.fn();
const queryUpsertMock = vi.fn();

function makeThenable<T>(value: T) {
  const result = {
    select: (..._args: unknown[]) => result,
    eq: (...args: unknown[]) => { return result; },
    then: (onFulfilled: (v: T) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(value).then(onFulfilled, onRejected)
  };
  return result;
}

const queryBuilder: any = {
  select: (...args: any[]) => {
    querySelectMock(...args);
    return queryBuilder;
  },
  gte: (...args: any[]) => {
    queryGteMock(...args);
    return queryBuilder;
  },
  lte: (...args: any[]) => {
    queryLteMock(...args);
    return queryBuilder;
  },
  upsert: (...args: any[]) => {
    queryUpsertMock(...args);
    return makeThenable({ data: [{ id: "b1" }], error: null });
  },
  then: makeThenable({ data: [], error: null }).then
};

const fromMock = vi.fn(() => queryBuilder);

vi.mock("../src/lib/data/supabase", () => {
  return {
    getSupabaseClient: () => ({
      from: fromMock
    })
  };
});

describe("data/repositories (bookings)", () => {
  beforeEach(() => {
    fromMock.mockClear();
    querySelectMock.mockReset();
    queryGteMock.mockReset();
    queryLteMock.mockReset();
    queryUpsertMock.mockReset();
  });

  it("listBookings filters by date range", async () => {
    const { listBookings } = await import("../src/lib/data/repositories");
    await listBookings({ rangeStart: "2025-01-01", rangeEnd: "2025-01-31" });

    expect(fromMock).toHaveBeenCalledWith("bookings");
    expect(querySelectMock).toHaveBeenCalledWith("*");
    expect(queryGteMock).toHaveBeenCalledWith("start_date", "2025-01-01");
    expect(queryLteMock).toHaveBeenCalledWith("end_date", "2025-01-31");
  });

  it("upsertBooking upserts booking payload", async () => {
    const { upsertBooking } = await import("../src/lib/data/repositories");
    await upsertBooking({ id: "b1", property_id: "p1" } as any);

    expect(fromMock).toHaveBeenCalledWith("bookings");
    expect(queryUpsertMock).toHaveBeenCalled();
  });
});
