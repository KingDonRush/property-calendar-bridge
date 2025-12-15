import { describe, expect, it } from "vitest";

import { createHttpServer } from "../src/httpServer";

describe("server static assets", () => {
  it("serves /assets/main.css", async () => {
    const server = createHttpServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;

    try {
      const response = await fetch(`http://localhost:${port}/assets/main.css`);
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type") ?? "").toContain("text/css");

      const css = await response.text();
      expect(css).toContain(":root");
      expect(css).toContain("--bg-");
      expect(css).toContain("--text-");
      expect(css).toContain("--space-");
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

