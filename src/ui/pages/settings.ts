import { getConfig } from "../../lib/config.js";

export async function renderSettingsPage(): Promise<string> {
  const config = getConfig();
  const secret = config.icalMasterSecret || "NOT_CONFIGURED";
  const icalRelativeUrl = `/api/ical/${secret}/master.ics`;

  return `<h1 style="margin: 0 0 24px;">Configurações</h1>

<div class="card" style="margin-bottom: 24px;">
  <h2 style="font-size: 1.25rem; margin: 0 0 16px;">Backup do Sistema</h2>
  <p class="muted" style="margin: 0 0 16px;">
    Exporte todos os dados (propriedades, reservas, mapeamentos e configurações) em formato JSON.
  </p>
  <a href="/api/admin/backup/export" class="btn" target="_blank">
    <span style="margin-right: 8px;">⬇️</span> Baixar Backup Completo
  </a>
</div>

<div class="card">
  <h2 style="font-size: 1.25rem; margin: 0 0 16px;">Master iCal URL</h2>
  <p class="muted" style="margin: 0 0 16px;">
    Utilize este link para exportar todas as reservas consolidadas para calendários externos (Google Calendar, etc).
    Mantenha esta URL secreta.
  </p>

  <div style="display: flex; gap: 8px; align-items: center; background: var(--bg-body); padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
    <input
      id="icalUrlInput"
      type="password"
      value="${icalRelativeUrl}"
      readonly
      style="flex: 1; border: none; background: transparent; font-family: monospace; font-size: 14px; outline: none;"
    />
    <button id="toggleVisibilityBtn" type="button" class="btn secondary" style="padding: 4px 8px; font-size: 12px;">Mostrar</button>
    <button id="copyBtn" type="button" class="btn secondary" style="padding: 4px 8px; font-size: 12px;">Copiar</button>
  </div>
  <div id="copyFeedback" style="font-size: 12px; color: var(--color-success); margin-top: 4px; display: none;">Copiado!</div>
</div>

<script>
(() => {
  const input = document.getElementById("icalUrlInput");
  const toggleBtn = document.getElementById("toggleVisibilityBtn");
  const copyBtn = document.getElementById("copyBtn");
  const feedback = document.getElementById("copyFeedback");

  if (input && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";
        toggleBtn.textContent = "Esconder";
      } else {
        input.type = "password";
        toggleBtn.textContent = "Mostrar";
      }
    });
  }

  if (input && copyBtn) {
    copyBtn.addEventListener("click", () => {
      // Resolve full URL
      const fullUrl = window.location.origin + input.value;

      navigator.clipboard.writeText(fullUrl).then(() => {
        if (feedback) {
          feedback.style.display = "block";
          setTimeout(() => {
            feedback.style.display = "none";
          }, 2000);
        }
      }).catch(err => {
        console.error("Falha ao copiar", err);
        alert("Erro ao copiar URL");
      });
    });
  }
})();
</script>`;
}
