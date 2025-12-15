import { describe, expect, it } from "vitest";

import { renderLoginPage } from "../src/ui/pages/login";

describe("ui/pages/login renderLoginPage", () => {
  it("renders a login form that posts token to /api/auth/login", () => {
    const html = renderLoginPage();
    expect(html).toContain("<form");
    expect(html).toContain('method="POST"');
    expect(html).toContain('action="/api/auth/login"');
    expect(html).toContain('name="token"');
    expect(html).toContain('type="password"');
  });

  it("renders an error message when provided", () => {
    const html = renderLoginPage("Token inválido");
    expect(html).toContain("Token inválido");
  });
});

