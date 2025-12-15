import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readAllMigrationSql(projectRoot: string): string {
  const migrationsDir = path.join(projectRoot, "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => path.join(migrationsDir, f));
  return files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
}

describe("supabase migrations (task 2.2)", () => {
  it("creates bookings and booking_mappings tables", () => {
    const combined = readAllMigrationSql(process.cwd());

    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.bookings/i
    );
    expect(combined).toMatch(/\bstart_date\b/i);
    expect(combined).toMatch(/\bend_date\b/i);
    expect(combined).toMatch(/\bstatus\b/i);

    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.booking_mappings/i
    );
    expect(combined).toMatch(/\bexternal_uid\b/i);
    expect(combined).toMatch(/\boriginal_data\b/i);
  });
});

