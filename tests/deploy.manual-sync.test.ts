import { describe, expect, it } from "vitest";

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..");

describe("deploy/manual sync", () => {
  it("provides a manual sync CLI script", () => {
    const scriptPath = path.join(projectRoot, "scripts", "manual-sync.ts");
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it("exposes npm script sync:manual", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")) as any;
    expect(typeof pkg?.scripts?.["sync:manual"]).toBe("string");
  });
});

