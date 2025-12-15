import { getAllSources } from "../../lib/data/repositories";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function renderSourcesPage(): Promise<string> {
  const sources = await getAllSources();
  const total = Array.isArray(sources) ? sources.length : 0;

  const header = `<h1 style="margin: 0 0 12px;">Fontes</h1>
<p class="muted" style="margin: 0 0 12px;">Total: ${total}</p>`;

  if (!Array.isArray(sources) || sources.length === 0) {
    return `${header}
<div class="muted">Nenhuma fonte cadastrada.</div>`;
  }

  const rows = sources
    .map((source) => {
      const record = source as Record<string, unknown>;
      const id = toStringOrEmpty(record.id);
      const name = toStringOrEmpty(record.source_name) || id || "—";
      const url = toStringOrEmpty(record.source_url);
      const refreshRate = toNumberOrNull(record.refresh_rate);
      const status = refreshRate === 0 ? "Desativada" : "Ativa";

      return `<tr>
  <td>${escapeHtml(name)}</td>
  <td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>` : "—"}</td>
  <td>${refreshRate === null ? "—" : escapeHtml(String(refreshRate))}</td>
  <td>${escapeHtml(status)}</td>
  <td class="muted">Editar / Excluir</td>
</tr>`;
    })
    .join("");

  return `${header}
<table class="table">
  <thead>
    <tr>
      <th>Nome</th>
      <th>URL</th>
      <th>Sync (min)</th>
      <th>Status</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;
}
