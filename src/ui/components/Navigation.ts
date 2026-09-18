function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export function renderNavigation(activePath: string): string {
  const current = normalizePath(activePath);

  const links: Array<{ href: string; label: string }> = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sources", label: "Fontes" },
    { href: "/admin/sync-runs", label: "Sync Runs" },
    { href: "/admin/bookings", label: "Reservas" },
    { href: "/admin/audit", label: "Auditoria" },
    { href: "/admin/settings", label: "Configurações" },
  ];

  const html = links
    .map(({ href, label }) => {
      const active = current === href;
      return `<a href="${href}"${active ? ' class="active"' : ""}>${escapeHtml(label)}</a>`;
    })
    .join("");

  return `<nav class="nav" aria-label="Admin navigation">${html}</nav>`;
}

export function renderHeader(): string {
  return `<div class="header">
  <div>
    <div><strong>simplePropertyManager</strong></div>
    <div class="muted">Admin</div>
  </div>
  <form method="POST" action="/api/auth/logout">
    <button class="btn secondary" type="submit">Sair</button>
  </form>
</div>`;
}

