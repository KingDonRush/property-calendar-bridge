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

describe("supabase migrations (task 2.3)", () => {
  it("creates sync_runs and audit_logs tables", () => {
    const combined = readAllMigrationSql(process.cwd());

    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.sync_runs/i
    );
    expect(combined).toMatch(/\bstarted_at\b/i);
    expect(combined).toMatch(/\bfinished_at\b/i);
    expect(combined).toMatch(/\blog_summary\b/i);

    expect(combined).toMatch(
      /create\s+table(\s+if\s+not\s+exists)?\s+public\.audit_logs/i
    );
    expect(combined).toMatch(/\btable_name\b/i);
    expect(combined).toMatch(/\bold_data\b/i);
    expect(combined).toMatch(/\bnew_data\b/i);
  });
});

