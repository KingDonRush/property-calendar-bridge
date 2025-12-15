import { getRecentSyncRuns, UiSyncRun } from "../../lib/ui/syncRuns";

function escapeHtml(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function renderRow(run: UiSyncRun): string {
  const statusColor = run.status === "success" ? "color: green;" : "color: red;";
  const errorMessage = run.errorMessage
    ? `<div style="font-size: 0.85em; color: red;">${escapeHtml(run.errorMessage)}</div>`
    : "";
  
  return `
    <tr>
      <td>${escapeHtml(run.id)}</td>
      <td style="${statusColor} font-weight: bold;">${escapeHtml(run.status)}</td>
      <td>${formatDate(run.startedAt)}</td>
      <td>${run.durationMs ? (run.durationMs / 1000).toFixed(1) + "s" : "-"}</td>
      <td>${run.conflictsCount ?? 0}</td>
      <td>${errorMessage}</td>
    </tr>
  `;
}

export async function renderSyncRunsPage(): Promise<string> {
  const runs = await getRecentSyncRuns(50);

  const rows = runs.map(renderRow).join("");

  return `
    <h1 style="margin-bottom: 2rem;">Histórico de Sincronização</h1>
    
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc;">
            <th style="padding: 8px;">ID</th>
            <th style="padding: 8px;">Status</th>
            <th style="padding: 8px;">Início</th>
            <th style="padding: 8px;">Duração</th>
            <th style="padding: 8px;">Conflitos</th>
            <th style="padding: 8px;">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6" style="padding: 16px; text-align: center;">Nenhum registro encontrado.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}
