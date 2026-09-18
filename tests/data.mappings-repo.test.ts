import { beforeEach, describe, expect, it, vi } from "vitest";

const querySelectMock = vi.fn();
const queryEqMock = vi.fn();
const queryInsertMock = vi.fn();

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
    return queryBuilder;
  },
  eq: (...args: any[]) => {
    queryEqMock(...args);
    return makeThenable({ data: [{ id: "m1" }], error: null });
  },
  upsert: (...args: any[]) => {
    queryInsertMock(...args);
    return makeThenable({ data: [{ id: "m1" }], error: null });
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

describe("data/repositories (mappings)", () => {
  beforeEach(() => {
    fromMock.mockClear();
    querySelectMock.mockReset();
    queryEqMock.mockReset();
    queryInsertMock.mockReset();
    vi.resetModules();
  });

  it("getMappingByExternalId scopes external UIDs to their channel source", async () => {
    const { getMappingByExternalId } = await import("../src/lib/data/repositories");
    const result = await getMappingByExternalId("ext-1", "s1");
    expect(fromMock).toHaveBeenCalledWith("booking_mappings");
    expect(querySelectMock).toHaveBeenCalledWith("*");
    expect(queryEqMock).toHaveBeenCalledWith("external_uid", "ext-1");
    expect(queryEqMock).toHaveBeenCalledWith("channel_source_id", "s1");
    expect(result).toEqual({ id: "m1" });
  });

  it("createMapping inserts into booking_mappings", async () => {
    const { createMapping } = await import("../src/lib/data/repositories");
    const result = await createMapping({ external_uid: "ext-1" } as any);
    expect(fromMock).toHaveBeenCalledWith("booking_mappings");
    expect(queryInsertMock).toHaveBeenCalled();
    expect(result).toEqual({ id: "m1" });
  });
});
