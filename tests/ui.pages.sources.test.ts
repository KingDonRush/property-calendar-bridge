import { beforeEach, describe, expect, it, vi } from "vitest";

const getAllSourcesMock = vi.fn(async (..._args: unknown[]) => [
  {
    id: "s1",
    source_name: "Airbnb",
    source_url: "https://example.com/airbnb.ics",
    refresh_rate: 30,
  },
  {
    id: "s2",
    source_name: "Booking",
    source_url: "https://example.com/booking.ics",
    refresh_rate: 0,
  },
]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: (...args: any[]) => getAllSourcesMock(...args),
  };
});

describe("ui/pages/sources", () => {
  beforeEach(() => {
    getAllSourcesMock.mockClear();
    vi.resetModules();
  });

  it("renders a table with the sources", async () => {
    const { renderSourcesPage } = await import("../src/ui/pages/sources");
    const html = await renderSourcesPage();
    expect(html).toContain("<table");
    expect(html).toContain("Airbnb");
    expect(html).toContain("Booking");
    expect(html).toContain("https://example.com/airbnb.ics");
  });

  it("renders an empty state when there are no sources", async () => {
    getAllSourcesMock.mockResolvedValueOnce([]);
    const { renderSourcesPage } = await import("../src/ui/pages/sources");
    const html = await renderSourcesPage();
    expect(html).toContain("Nenhuma fonte");
    expect(html).not.toContain("<table");
  });

  it("renders a create/edit form with basic fields", async () => {
    const { renderSourcesPage } = await import("../src/ui/pages/sources");
    const html = await renderSourcesPage();
    expect(html).toContain('id="sourceForm"');
    expect(html).toContain('name="source_name"');
    expect(html).toContain('name="source_url"');
    expect(html).toContain('type="url"');
    expect(html).toContain('name="refresh_rate"');
  });

  it("includes a client-side script for save/test flows", async () => {
    const { renderSourcesPage } = await import("../src/ui/pages/sources");
    const html = await renderSourcesPage();
    expect(html).toContain("<script");
    expect(html).toContain("/api/admin/sources/test");
    expect(html).toContain("/api/admin/sources");
    expect(html).toContain("window.location.reload");
  });
});
