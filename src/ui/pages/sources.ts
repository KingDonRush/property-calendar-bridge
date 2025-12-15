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

function renderForm(): string {
  return `<form id="sourceForm" class="card" style="margin: 0 0 16px;">
  <div style="display: grid; gap: 12px; grid-template-columns: 180px 1fr 2fr 140px;">
    <label>
      <div class="muted" style="margin: 0 0 4px;">Property ID</div>
      <input class="input" name="property_id" type="text" required />
    </label>
    <label>
      <div class="muted" style="margin: 0 0 4px;">Nome</div>
      <input class="input" name="source_name" type="text" required />
    </label>
    <label>
      <div class="muted" style="margin: 0 0 4px;">iCal URL</div>
      <input class="input" name="source_url" type="url" required />
    </label>
    <label>
      <div class="muted" style="margin: 0 0 4px;">Sync (min)</div>
      <input class="input" name="refresh_rate" type="number" min="0" step="1" value="30" required />
    </label>
  </div>
  <div style="display: flex; gap: 8px; margin-top: 12px;">
    <button class="btn" type="submit">Salvar</button>
    <button class="btn secondary" type="button" id="testSourceBtn">Testar fonte</button>
  </div>
</form>`;
}

function renderScript(): string {
  return `<script>
(() => {
  const alertEl = document.getElementById("sourcesAlert");
  const form = document.getElementById("sourceForm");
  const testBtn = document.getElementById("testSourceBtn");

  function showAlert(message) {
    if (!alertEl) return;
    alertEl.textContent = message;
    alertEl.style.display = "block";
  }

  function clearAlert() {
    if (!alertEl) return;
    alertEl.textContent = "";
    alertEl.style.display = "none";
  }

  async function parseJsonSafe(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearAlert();

      const data = new FormData(form);
      const payload = {
        property_id: String(data.get("property_id") ?? ""),
        source_name: String(data.get("source_name") ?? ""),
        source_url: String(data.get("source_url") ?? ""),
        refresh_rate: Number(data.get("refresh_rate") ?? 0),
      };

      const response = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const body = await parseJsonSafe(response);
        showAlert(body && body.message ? body.message : "Falha ao salvar a fonte");
        return;
      }

      window.location.reload();
    });
  }

  if (testBtn && form) {
    testBtn.addEventListener("click", async () => {
      clearAlert();
      const data = new FormData(form);
      const url = String(data.get("source_url") ?? "");

      const response = await fetch("/api/admin/sources/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const body = await parseJsonSafe(response);
      if (!response.ok) {
        showAlert(body && body.message ? body.message : "Falha ao testar a fonte");
        return;
      }

      const count = body && typeof body.eventCount === "number" ? body.eventCount : 0;
      showAlert(\`OK: \${count} eventos\`);
    });
  }
})();
</script>`;
}

export async function renderSourcesPage(): Promise<string> {
  const sources = await getAllSources();
  const total = Array.isArray(sources) ? sources.length : 0;

  const header = `<h1 style="margin: 0 0 12px;">Fontes</h1>
<p class="muted" style="margin: 0 0 12px;">Total: ${total}</p>`;

  const alert = `<div id="sourcesAlert" class="card" style="display:none; margin: 0 0 16px;"></div>`;
  const form = renderForm();
  const script = renderScript();

  if (!Array.isArray(sources) || sources.length === 0) {
    return `${header}
${form}
${alert}
${script}
<div class="muted">Nenhuma fonte cadastrada.</div>`;
  }

  const rows = sources
    .map((source) => {
      const record = source as Record<string, unknown>;
      const id = toStringOrEmpty(record.id);
      const name = toStringOrEmpty(record.source_name) || id || "-";
      const url = toStringOrEmpty(record.source_url);
      const refreshRate = toNumberOrNull(record.refresh_rate);
      const status = refreshRate === 0 ? "Desativada" : "Ativa";

      return `<tr>
  <td>${escapeHtml(name)}</td>
  <td>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a>` : "-"}</td>
  <td>${refreshRate === null ? "-" : escapeHtml(String(refreshRate))}</td>
  <td>${escapeHtml(status)}</td>
  <td class="muted">Editar / Excluir</td>
</tr>`;
    })
    .join("");

  return `${header}
${form}
${alert}
<table class="table">
  <thead>
    <tr>
      <th>Nome</th>
      <th>URL</th>
      <th>Sync (min)</th>
      <th>Status</th>
      <th>Acoes</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
${script}`;
}

