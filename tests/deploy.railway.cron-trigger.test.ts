import { describe, expect, it } from "vitest";

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..");

describe("deploy/railway cron trigger script", () => {
  it("provides a curl script for Railway cron", () => {
    const scriptPath = path.join(projectRoot, "scripts", "cron-trigger.sh");
    expect(fs.existsSync(scriptPath)).toBe(true);

    const contents = fs.readFileSync(scriptPath, "utf8");
    expect(contents).toMatch(/^#!\/usr\/bin\/env bash/m);
    expect(contents).toContain("/api/jobs/sync");
    expect(contents).toMatch(/Authorization:\s*Bearer/i);
    expect(contents).toContain("PUBLIC_URL");
  });
});

