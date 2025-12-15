import { describe, expect, it } from "vitest";

import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(__dirname, "..");

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

describe("deploy/railway scripts", () => {
  it("defines build and start scripts", () => {
    const pkg = readJson(path.join(projectRoot, "package.json")) as any;
    expect(typeof pkg?.scripts?.build).toBe("string");
    expect(typeof pkg?.scripts?.start).toBe("string");
  });

  it("has a build tsconfig that emits to dist/", () => {
    const tsconfig = readJson(path.join(projectRoot, "tsconfig.build.json")) as any;
    expect(tsconfig?.compilerOptions?.outDir).toBe("dist");
  });
});

