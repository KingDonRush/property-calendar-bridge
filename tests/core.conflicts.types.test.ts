import { describe, expect, it } from "vitest";

import { ConflictSeverity, ConflictType } from "../src/lib/core/conflicts";

describe("core/conflicts types", () => {
  it("exposes ConflictSeverity values", () => {
    expect(ConflictSeverity.Warning).toBe("warning");
    expect(ConflictSeverity.Critical).toBe("critical");
  });

  it("exposes ConflictType values", () => {
    expect(ConflictType.Overlap).toBe("overlap");
    expect(ConflictType.Adjacent).toBe("adjacent");
    expect(ConflictType.Double).toBe("double");
    expect(ConflictType.BufferViolation).toBe("buffer_violation");
  });
});
