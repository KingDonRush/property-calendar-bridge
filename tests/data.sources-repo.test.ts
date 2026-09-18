import { beforeEach, describe, expect, it, vi } from "vitest";

const querySelectMock = vi.fn();
const queryUpdateMock = vi.fn();
const queryEqMock = vi.fn();

function makeThenable<T>(value: T) {
  const result = {
    select: (..._args: unknown[]) => result,
    eq: (...args: unknown[]) => { if (typeof queryEqMock !== "undefined") queryEqMock(...args); return result; },
    then: (onFulfilled: (v: T) => unknown, onRejected?: (e: unknown) => unknown) =>
      Promise.resolve(value).then(onFulfilled, onRejected)
  };
  return result;
}

const queryBuilder: any = {
  select: (...args: any[]) => {
    querySelectMock(...args);
    return makeThenable({ data: [], error: null });
  },
  update: (...args: any[]) => {
    queryUpdateMock(...args);
    return queryBuilder;
  },
  eq: (...args: any[]) => {
    queryEqMock(...args);
    return makeThenable({ data: [{ id: "s1" }], error: null });
  }
};

const fromMock = vi.fn(() => queryBuilder);

vi.mock("../src/lib/data/supabase", () => {
  return {
    getSupabaseClient: () => ({
      from: fromMock
    })
  };
});

describe("data/repositories (sources)", () => {
  beforeEach(() => {
    fromMock.mockClear();
    querySelectMock.mockReset();
    queryUpdateMock.mockReset();
    queryEqMock.mockReset();
    vi.resetModules();
  });

  it("getAllSources selects from channel_sources", async () => {
    const { getAllSources } = await import("../src/lib/data/repositories");
    await getAllSources();
    expect(fromMock).toHaveBeenCalledWith("channel_sources");
    expect(querySelectMock).toHaveBeenCalledWith("*");
  });

  it("updateSourceStatus updates by id", async () => {
    const { updateSourceStatus } = await import("../src/lib/data/repositories");
    await updateSourceStatus("s1", { status: "ok", last_synced_at: "now" });

    expect(fromMock).toHaveBeenCalledWith("channel_sources");
    expect(queryUpdateMock).toHaveBeenCalled();
    expect(queryEqMock).toHaveBeenCalledWith("id", "s1");
  });
});

