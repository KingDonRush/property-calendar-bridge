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

describe("supabase migrations (task 2.4)", () => {
  it("creates conflicts table", () => {
    const combined = readAllMigrationSql(process.cwd());

    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.conflicts/i
    );
    expect(combined).toMatch(/\bconflict_type\b/i);
    expect(combined).toMatch(/\bstatus\b/i);
    expect(combined).toMatch(/\bresolved_at\b/i);
    expect(combined).toMatch(/\bresolution_notes\b/i);
  });
});

