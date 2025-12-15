import { beforeEach, describe, expect, it, vi } from "vitest";

const rangeMock = vi.fn();
const orderMock = vi.fn(() => ({ range: rangeMock }));
const selectMock = vi.fn(() => ({ order: orderMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("../src/lib/data/supabase", () => {
  return {
    getSupabaseClient: () => ({
      from: fromMock,
    }),
  };
});

describe("audit service listAuditLogs", () => {
  beforeEach(() => {
    rangeMock.mockReset();
    orderMock.mockClear();
    selectMock.mockClear();
    fromMock.mockClear();
    vi.resetModules();
  });

  it("queries audit_logs with ordering and pagination", async () => {
    rangeMock.mockResolvedValue({ data: [{ id: "a1" }], error: null });

    const { listAuditLogs } = await import("../src/lib/audit/service");
    const result = await listAuditLogs({ limit: 10, offset: 20 });

    expect(fromMock).toHaveBeenCalledWith("audit_logs");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(rangeMock).toHaveBeenCalledWith(20, 29);
    expect(result).toEqual([{ id: "a1" }]);
  });

  it("throws when supabase returns an error", async () => {
    rangeMock.mockResolvedValue({ data: null, error: new Error("db down") });
    const { listAuditLogs } = await import("../src/lib/audit/service");
    await expect(listAuditLogs({ limit: 1, offset: 0 })).rejects.toThrow(/db down/i);
  });
});

