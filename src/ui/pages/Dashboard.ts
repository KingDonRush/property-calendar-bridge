import { getDashboardStats } from "../../lib/ui/dashboardStats";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function renderDashboardPage(): Promise<string> {
  const stats = await getDashboardStats();

  const lastSync =
    stats.lastSyncRun && (stats.lastSyncRun.startedAt || stats.lastSyncRun.status)
      ? `${stats.lastSyncRun.status ?? "unknown"} (${stats.lastSyncRun.startedAt ?? "unknown"})`
      : "Nunca";

  return `<h1 style="margin: 0 0 12px;">Dashboard</h1>
<div style="display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
  <div class="card">
    <div class="muted" style="margin: 0 0 6px;">Status do sistema</div>
    <div style="font-size: 18px; font-weight: 700;">${escapeHtml(stats.health.status)}</div>
  </div>
  <div class="card">
    <div class="muted" style="margin: 0 0 6px;">Total de fontes</div>
    <div style="font-size: 18px; font-weight: 700;">${escapeHtml(String(stats.sourcesCount))}</div>
  </div>
  <div class="card">
    <div class="muted" style="margin: 0 0 6px;">Ultima sincronizacao</div>
    <div style="font-size: 14px; font-weight: 600;">${escapeHtml(lastSync)}</div>
  </div>
</div>`;
}
