import { describe, expect, it } from "vitest";

import { renderHtmlHead } from "../src/ui/utils/htmlHead";

describe("ui/utils/htmlHead renderHtmlHead", () => {
  it("renders head with title, viewport and main css link", () => {
    const head = renderHtmlHead({ title: "Dashboard" });
    expect(head).toContain("<head>");
    expect(head).toContain("<title>Dashboard</title>");
    expect(head).toContain('name="viewport"');
    expect(head).toContain('rel="stylesheet"');
    expect(head).toContain('href="/assets/main.css?v=2"');
  });
});

