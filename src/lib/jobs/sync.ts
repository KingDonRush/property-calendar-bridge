import { getAllSources } from "../data/repositories";
import { syncSource } from "../ical/sync";

export type SyncJobResult = {
  ok: true;
  results: unknown[];
};

export async function runSyncJob(): Promise<SyncJobResult> {
  const sources = await getAllSources();

  const results: unknown[] = [];
  for (const source of sources) {
    const sourceId = typeof (source as any)?.id === "string" ? (source as any).id : null;
    if (!sourceId) continue;

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

