import { renderHeader, renderNavigation } from "./Navigation.js";
import { renderHtmlHead } from "../utils/htmlHead.js";

export type LayoutOptions = {
  title: string;
  activePath: string;
  content: string;
};

export function renderLayout(options: LayoutOptions): string {
  const head = renderHtmlHead({ title: options.title });
  const header = `
  <div class="header">
    <div style="display:flex; align-items:center; gap: 12px">
      <button id="mobile-menu-toggle" class="btn secondary icon-only" aria-label="Menu" style="padding: 8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <div>
        <div><strong>simplePropertyManager</strong></div>
        <div class="muted">Admin</div>
      </div>
    </div>
    <form method="POST" action="/api/auth/logout">
      <button class="btn secondary" type="submit">Sair</button>
    </form>
  </div>`;
  const nav = renderNavigation(options.activePath);

  return `<!doctype html>
<html lang="pt-BR">
${head}
<body>
  <div class="container">
    ${header}
    ${nav}
    <div style="height: 16px"></div>
    <div class="card">
      ${options.content}
    </div>
  </div>
</body>
</html>`;
}

