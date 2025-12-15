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
</div>
<div style="margin-top: 12px; display: flex; gap: 8px; align-items: center;">
  <button class="btn" type="button" id="btn-sync-now">Sync Now</button>
  <div id="syncNowMsg" class="muted"></div>
</div>
<script>
(() => {
  const btn = document.getElementById("btn-sync-now");
  const msg = document.getElementById("syncNowMsg");

  function setMsg(text) {
    if (!msg) return;
    msg.textContent = text;
  }

  async function parseJsonSafe(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  if (!btn) return;

  btn.addEventListener("click", async () => {
    setMsg("Sincronizando...");
    btn.disabled = true;

    const response = await fetch("/api/admin/sync", { method: "POST" });
    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    const body = await parseJsonSafe(response);
    if (!response.ok) {
      setMsg(body && body.message ? body.message : "Falha ao sincronizar");
      btn.disabled = false;
      return;
    }

    setMsg("OK. Recarregando...");
    window.location.reload();
  });
})();
</script>`;
}
