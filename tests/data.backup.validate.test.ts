import { describe, expect, it } from "vitest";

import { validateBackupFile } from "../src/lib/data/backup";

describe("data/backup validateBackupFile", () => {
  it("returns true for a valid backup file", () => {
    const ok = validateBackupFile(
      JSON.stringify({
        meta: { schemaVersion: 1, appVersion: "x", createdAt: "2025-01-01T00:00:00.000Z" },
        data: { sources: [], bookings: [], mappings: [] }
      })
    );
    expect(ok).toBe(true);
  });

  it("returns false for invalid JSON", () => {
    expect(validateBackupFile("{")).toBe(false);
  });

  it("returns false for missing required keys", () => {
    const bad = validateBackupFile(JSON.stringify({ meta: { schemaVersion: 1 }, data: {} }));
    expect(bad).toBe(false);
  });
});

