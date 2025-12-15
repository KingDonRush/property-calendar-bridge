import { getDashboardStats } from "../../lib/ui/dashboardStats";

export async function renderDashboardPage(): Promise<string> {
  const stats = await getDashboardStats();

  return `<h1 style="margin: 0 0 12px;">Dashboard</h1>
<p class="muted" style="margin: 0 0 12px;">Status: ${stats.health.status}</p>`;
}

