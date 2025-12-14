import { describe, expect, it } from "vitest";

import { ConflictType, SyncRunStatus } from "../src/lib/models/types";

describe("models/types (sync control types)", () => {
  it("exports control/sync types", () => {
    expect(SyncRunStatus.Success).toBe("success");
    expect(ConflictType.Overlap).toBe("overlap");
  });
});
