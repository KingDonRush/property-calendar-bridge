import { describe, expect, it } from "vitest";

import { renderLayout } from "../src/ui/components/Layout";

describe("ui/components/Layout renderLayout", () => {
  it("wraps content with a full HTML document, head, header and navigation", () => {
    const html = renderLayout({
      title: "Dashboard",
      activePath: "/admin",
      content: "<p>Hello</p>",
    });

    expect(html.toLowerCase()).toContain("<!doctype html>");
    expect(html).toContain("<title>Dashboard</title>");
    expect(html).toContain('href="/assets/main.css?v=2"');
    expect(html).toContain('href="/admin/sources"');
    expect(html).toContain("<p>Hello</p>");
  });
});

