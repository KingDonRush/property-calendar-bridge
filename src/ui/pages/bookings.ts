import { getBookings, UiBooking } from "../../lib/ui/bookings";

function escapeHtml(value: string | undefined | null): string {
  if (value === undefined || value === null) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getMonthRange(date: Date) {
  // Use UTC to ensure the ISO string matches the intended calendar dates
  // date object passed in might be local, so we extract year/month
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // Last day of the month: month + 1 with day 0
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return { start, end };
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR");
  } catch {
    return iso;
  }
}

export async function renderBookingsPage(query: URLSearchParams): Promise<string> {
  const now = new Date();

  // Simple "month=YYYY-MM" handling or default to current
  let targetDate = now;
  const monthParam = query.get("month"); // e.g., "2023-10"
  if (monthParam) {
    const [y, m] = monthParam.split("-").map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      // Create date at noon to avoid timezone shift issues when just getting year/month
      targetDate = new Date(y, m - 1, 15);
    }
  }

  const { start, end } = getMonthRange(targetDate);

  // Format dates for API (ISO string usually expected, but check repository needs)
  // Assuming repository expects ISO strings or YYYY-MM-DD
  const rangeStart = start.toISOString();
  const rangeEnd = end.toISOString();

  const bookings = await getBookings({ rangeStart, rangeEnd });

  // Navigation Links
  const prevDate = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
  const nextDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

  const toMonthStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const prevLink = `/admin/bookings?month=${toMonthStr(prevDate)}`;
  const nextLink = `/admin/bookings?month=${toMonthStr(nextDate)}`;
  const currentTitle = targetDate.toLocaleDateString("pt-BR", { month: 'long', year: 'numeric' });

  const rows = bookings.map(b => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(b.id)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(b.guestName || "N/A")}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(b.propertyId)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${formatDate(b.startDate)} - ${formatDate(b.endDate)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(b.status)}</td>
    </tr>
  `).join("");

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h1>Reservas: ${escapeHtml(currentTitle)}</h1>
      <div>
        <a href="${prevLink}" class="btn" style="margin-right: 8px;">&larr; Anterior</a>
        <a href="${nextLink}" class="btn">Próximo &rarr;</a>
      </div>
    </div>

    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc;">
            <th style="padding: 8px;">ID</th>
            <th style="padding: 8px;">Hóspede</th>
            <th style="padding: 8px;">Propriedade</th>
            <th style="padding: 8px;">Período</th>
            <th style="padding: 8px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5" style="padding: 16px; text-align: center;">Nenhuma reserva neste mês.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}
