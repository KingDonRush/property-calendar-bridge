import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readAllMigrationSql(projectRoot: string): string[] {
  const migrationsDir = path.join(projectRoot, "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => path.join(migrationsDir, f));
  return files.map((file) => fs.readFileSync(file, "utf8"));
}

describe("supabase migrations (task 2.1)", () => {
  it("creates properties and channel_sources tables", () => {
    const sqlFiles = readAllMigrationSql(process.cwd());
    const combined = sqlFiles.join("\n");

    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.properties/i
    );
    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.channel_sources/i
    );
    expect(combined).toMatch(/\bslug\b/i);
    expect(combined).toMatch(/\bsource_url\b/i);
  });
});
