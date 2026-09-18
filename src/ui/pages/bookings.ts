import { listBookings } from "../../lib/data/repositories.js";

function escapeHtml(value: string): string {
  if (!value) return "";
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
    // Ajuste simples para não perder o dia por fuso horário se for string YYYY-MM-DD pura
    if (dateStr.length === 10) {
      const portions = dateStr.split("-");
      return `${portions[2]}/${portions[1]}/${portions[0]}`;
    }
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

export async function renderBookingsPage(searchParams: URLSearchParams): Promise<string> {
  const today = new Date();

  // Parametros ou Mês Atual
  let startStr = searchParams.get("start");
  let endStr = searchParams.get("end");

  if (!startStr || !endStr) {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Format YYYY-MM-DD ignoring timezone offset issues for local display logic
    // Using simple formatting to avoid UTC vs Local shifts
    startStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-01`;
    endStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  }

  // Lógica para Proximo/Anterior
  const currentStart = new Date(startStr);
  const prevMonthStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1);
  const prevMonthEnd = new Date(currentStart.getFullYear(), currentStart.getMonth(), 0);

  const nextMonthStart = new Date(currentStart.getFullYear(), currentStart.getMonth() + 1, 1);
  const nextMonthEnd = new Date(currentStart.getFullYear(), currentStart.getMonth() + 2, 0);

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const prevLink = `?start=${fmt(prevMonthStart)}&end=${fmt(prevMonthEnd)}`;
  const nextLink = `?start=${fmt(nextMonthStart)}&end=${fmt(nextMonthEnd)}`;

  // Título do mês (baseado no start date)
  const monthTitle = currentStart.toLocaleDateString("pt-BR", { month: 'long', year: 'numeric' });
  const capitalizedTitle = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);

  const bookings = await listBookings({ rangeStart: startStr, rangeEnd: endStr });

  const header = `
  <div class="controls-row" style="display: flex; justify-content: space-between; align-items: center; margin: 0 0 16px;">
    <h1 style="margin: 0;">Reservas</h1>
    <div style="display: flex; gap: 8px; align-items: center;">
      <a href="${prevLink}" class="btn secondary pagination-btn" style="text-decoration: none;">&larr; <span class="pagination-text">Anterior</span></a>
      <span style="font-weight: 600; min-width: 140px; text-align: center;">${capitalizedTitle}</span>
      <a href="${nextLink}" class="btn secondary pagination-btn" style="text-decoration: none;"><span class="pagination-text">Próximo</span> &rarr;</a>
    </div>
  </div>`;

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return `${header}
    <div class="card muted">Nenhuma reserva encontrada para este período.</div>`;
  }

  const rows = bookings
    .map((item: any) => {
      return `<tr>
  <td>${escapeHtml(item.property_id || "-")}</td>
  <td>${escapeHtml(item.guest_name || "Não informado")}</td>
  <td>${formatDate(item.start_date)} a ${formatDate(item.end_date)}</td>
  <td>${escapeHtml(item.platform || "-")}</td>
  <td>${escapeHtml(item.status || "CONFIRMED")}</td>
</tr>`;
    })
    .join("");

  return `${header}
<div class="table-container">
<table class="table">
  <thead>
    <tr>
      <th>Imóvel</th>
      <th>Hóspede</th>
      <th>Período</th>
      <th>Plataforma</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
</div>`;
}
