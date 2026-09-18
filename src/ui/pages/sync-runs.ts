import { listSyncRuns } from "../../lib/data/repositories.js";

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleString("pt-BR");
    } catch {
        return dateStr;
    }
}

export async function renderSyncRunsPage(): Promise<string> {
    const runs = await listSyncRuns();

    const header = `<h1 style="margin: 0 0 12px;">Histórico de Sincronização</h1>
<p class="muted" style="margin: 0 0 12px;">Últimas 50 execuções</p>`;

    if (!Array.isArray(runs) || runs.length === 0) {
        return `${header}
<div class="muted">Nenhum registro encontrado.</div>`;
    }

    const rows = runs
        .map((run: any) => {
            const status = run.status || "unknown";
            const statusColor =
                status === "success" ? "var(--color-success, green)" : status === "failed" ? "var(--color-danger, red)" : "var(--color-text-muted, gray)";

            let duration = "-";
            if (run.started_at && run.finished_at) {
                const ms = new Date(run.finished_at).getTime() - new Date(run.started_at).getTime();
                duration = ms < 1000 ? `${ms}ms` : `${Math.round(ms / 1000)}s`;
            }

            return `<tr>
  <td>${formatDate(run.started_at)}</td>
  <td><span style="color: ${statusColor}; font-weight: 500;">${escapeHtml(status)}</span></td>
  <td>${duration}</td>
  <td class="muted" style="font-size: 0.9em;">${escapeHtml(String(run.log_summary?.error || JSON.stringify(run.log_summary ?? {})))}</td>
</tr>`;
        })
        .join("");

    return `${header}
<div class="table-container">
<table class="table">
  <thead>
    <tr>
      <th>Início</th>
      <th>Status</th>
      <th>Duração</th>
      <th>Detalhes</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
</div>`;
}
