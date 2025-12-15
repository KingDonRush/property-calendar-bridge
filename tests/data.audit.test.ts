import { beforeEach, describe, expect, it, vi } from "vitest";

const insertMock = vi.fn();
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("../src/lib/data/supabase", () => {
  return {
    getSupabaseClient: () => ({
      from: fromMock
    })
  };
});

describe("data/audit insertAuditLog", () => {
  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
    vi.resetModules();
  });

  it("inserts into audit_logs", async () => {
    insertMock.mockResolvedValue({ data: null, error: null });
    const { insertAuditLog } = await import("../src/lib/data/audit");

    await insertAuditLog({
      id: "a1",
      at: new Date().toISOString(),
      action: "insert",
      entity_type: "sync_run",
      entity_id: "e1",
      meta: { ok: true }
    });

    expect(fromMock).toHaveBeenCalledWith("audit_logs");
    expect(insertMock).toHaveBeenCalled();
  });

  it("does not throw on insert errors, but reports them", async () => {
    insertMock.mockResolvedValue({ data: null, error: new Error("db down") });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { insertAuditLog } = await import("../src/lib/data/audit");
    await expect(
      insertAuditLog({
        id: "a1",
        at: new Date().toISOString(),
        action: "insert",
        entity_type: "sync_run",
        entity_id: "e1"
      })
    ).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

