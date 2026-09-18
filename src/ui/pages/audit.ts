import { listAuditLogs } from "../../lib/audit/service.js";

function escapeHtml(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
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

export async function renderAuditPage(searchParams: URLSearchParams): Promise<string> {
  const limit = 100; // Hardcoded limit for simplicity as per requirements list
  const offset = 0;  // Pagination can be added later if needed

  const logs = await listAuditLogs({ limit, offset });

  const header = `<h1 style="margin: 0 0 12px;">Logs de Auditoria</h1>
<p class="muted" style="margin: 0 0 12px;">Últimos ${limit} registros</p>`;

  if (!Array.isArray(logs) || logs.length === 0) {
    return `${header}
<div class="muted">Nenhum log encontrado.</div>`;
  }

  const rows = logs
    .map((log: any) => {
      // Assuming log structure based on standard audit patterns: created_at, action, actor, target_resource, details
      // Adjust property names if schema differs (checked service.ts, it selects *, need to infer schema from common practices or just dump)
      // Since I can't see the DB schema, I'll assume standard naming but handle missing fields gracefully

      const action = log.action || "UNKNOWN";
      const resource = log.target_resource || log.resource || "-";
      const details = log.details ? JSON.stringify(log.details) : "-";
      const actor = log.actor_id || log.user_id || "System"; // Simplified

      return `<tr>
  <td>${formatDate(log.created_at)}</td>
  <td><span style="font-weight: 500;">${escapeHtml(action)}</span></td>
  <td>${escapeHtml(resource)}</td>
  <td>${escapeHtml(actor)}</td>
  <td class="muted" style="font-size: 0.85em; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(details)}">${escapeHtml(details)}</td>
</tr>`;
    })
    .join("");

  return `${header}
<div class="table-container">
<table class="table">
  <thead>
    <tr>
      <th style="width: 180px;">Data</th>
      <th style="width: 150px;">Ação</th>
      <th style="width: 150px;">Recurso</th>
      <th style="width: 150px;">Ator</th>
      <th>Detalhes</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
</div>`;
}
