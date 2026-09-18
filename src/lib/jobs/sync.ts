import { getAllSources } from "../data/repositories.js";
import { syncSource } from "../ical/sync.js";

export type SyncJobResult = {
  ok: true;
  results: ({ sourceId: string; ok: true; result: Awaited<ReturnType<typeof syncSource>> } | { sourceId: string; ok: false; error: string })[];
};

export async function runSyncJob(): Promise<SyncJobResult> {
  const sources = await getAllSources();

  const results: SyncJobResult["results"] = [];
  for (const source of sources) {
    const sourceId = typeof (source as any)?.id === "string" ? (source as any).id : null;
    if (!sourceId || (source as any)?.refresh_rate === 0) continue;

    try {
      const result = await syncSource(sourceId);
      results.push({ sourceId, ok: true, result });
    } catch (error) {
      results.push({
        sourceId,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { ok: true, results };
}

