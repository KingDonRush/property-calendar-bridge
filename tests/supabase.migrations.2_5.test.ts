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

describe("supabase migrations (task 2.5)", () => {
  it("enables RLS and adds key indexes", () => {
    const combined = readAllMigrationSql(process.cwd());

    expect(combined).toMatch(/enable\s+row\s+level\s+security/i);
    expect(combined).toMatch(/create\s+index/i);
    expect(combined).toMatch(/\bbookings\b[\s\S]*\bstart_date\b/i);
    expect(combined).toMatch(/\bbooking_mappings\b[\s\S]*\bexternal_uid\b/i);
  });
});

