import { getAllSources } from "../../lib/data/repositories";

export async function renderSourcesPage(): Promise<string> {
  const sources = await getAllSources();
  const total = Array.isArray(sources) ? sources.length : 0;

  return `<h1 style="margin: 0 0 12px;">Fontes</h1>
<p class="muted" style="margin: 0 0 12px;">Total: ${total}</p>`;
}

