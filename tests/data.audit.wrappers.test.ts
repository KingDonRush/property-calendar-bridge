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

describe("data/audit wrappers", () => {
  beforeEach(() => {
    insertMock.mockReset();
    fromMock.mockClear();
    vi.resetModules();
  });

  it("logSyncOperation formats and persists a log entry", async () => {
    insertMock.mockResolvedValue({ data: null, error: null });
    const { logSyncOperation } = await import("../src/lib/data/audit");

    await logSyncOperation({ sourceId: "s1", imported: 1 });

    expect(fromMock).toHaveBeenCalledWith("audit_logs");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "insert",
        table_name: "sync",
        record_id: null,
        new_data: { entity_id: "s1", sourceId: "s1", imported: 1 }
      })
    );
  });

  it("logConflictResolution formats and persists a log entry", async () => {
    insertMock.mockResolvedValue({ data: null, error: null });
    const { logConflictResolution } = await import("../src/lib/data/audit");

    await logConflictResolution("c1", "resolved");

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "update",
        table_name: "conflict",
        record_id: null,
        new_data: { entity_id: "c1", decision: "resolved" }
      })
    );
  });
});

