import { describe, expect, it } from "vitest";

import { renderHeader, renderNavigation } from "../src/ui/components/Navigation";

describe("ui/components/Navigation", () => {
  it("renders expected admin navigation links", () => {
    const html = renderNavigation("/admin");
    expect(html).toContain('href="/admin"');
    expect(html).toContain('href="/admin/sources"');
    expect(html).toContain('href="/admin/sync-runs"');
    expect(html).toContain('href="/admin/bookings"');
    expect(html).toContain('href="/admin/audit"');
    expect(html).toContain('href="/admin/backup"');
  });

  it("marks the active link", () => {
    const html = renderNavigation("/admin/sources");
    expect(html).toContain('href="/admin/sources" class="active"');
  });

  it("renders logout action in header", () => {
    const html = renderHeader();
    expect(html).toContain('action="/api/auth/logout"');
    expect(html).toContain('method="POST"');
  });
});

