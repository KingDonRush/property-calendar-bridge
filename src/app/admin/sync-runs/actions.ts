"use server"

import { runSyncJob } from "../../../lib/jobs/sync.js"
import { revalidatePath } from "next/cache"
import { getSupabaseClient } from "../../../lib/data/supabase.js"
import { requireAdminAction } from "../../../lib/ui-auth/next.js"

// Types
export type SyncLog = {
    id: string
    status: string
    startedAt: string
    finishedAt?: string
    durationMs?: number
    sourceName?: string
    imported?: number
    upserted?: number
    conflicts?: number
    errorMessage?: string
}

export type ActionResult<T = void> = {
    success: boolean
    error?: string
    data?: T
}


// Parse sync run from DB
function parseSyncLog(raw: Record<string, unknown>): SyncLog | null {
    const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "")
    const status = typeof raw.status === "string" ? raw.status : "unknown"
    const startedAt = typeof raw.started_at === "string" ? raw.started_at : ""
    const finishedAt = typeof raw.finished_at === "string" ? raw.finished_at : undefined

    if (!id || !startedAt) return null

    // Calculate duration
    let durationMs: number | undefined
    if (startedAt && finishedAt) {
        const start = new Date(startedAt).getTime()
        const end = new Date(finishedAt).getTime()
        if (!isNaN(start) && !isNaN(end) && end >= start) {
            durationMs = end - start
        }
    }

    // Parse log_summary
    const logSummary = raw.log_summary as Record<string, unknown> | undefined
    const imported = typeof logSummary?.imported === "number" ? logSummary.imported : undefined
    const upserted = typeof logSummary?.upserted === "number" ? logSummary.upserted : undefined
    const conflicts = typeof logSummary?.conflicts === "number" ? logSummary.conflicts : undefined
    const errorMessage = typeof logSummary?.error === "string" ? logSummary.error : undefined

    return {
        id,
        status,
        startedAt,
        finishedAt,
        durationMs,
        imported,
        upserted,
        conflicts,
        errorMessage,
    }
}

// Get sync logs
export async function getSyncLogs(limit = 50): Promise<ActionResult<SyncLog[]>> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from("sync_runs")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(limit)

        if (error) {
            return { success: false, error: error.message }
        }

        const logs = (data ?? [])
            .map((row) => parseSyncLog(row as Record<string, unknown>))
            .filter((log): log is SyncLog => log !== null)

        return { success: true, data: logs }
    } catch (error) {
        return { success: false, error: "Erro ao buscar logs de sincronização" }
    }
}

// Trigger sync for all sources
export async function triggerSync(): Promise<ActionResult<{ sourcesProcessed: number; totalImported: number }>> {
    try {
        await requireAdminAction()
        const job = await runSyncJob()
        const successful = job.results.filter((entry) => entry.ok)
        const failures = job.results.filter((entry) => !entry.ok)
        revalidatePath("/admin")
        revalidatePath("/admin/sync-runs")
        revalidatePath("/admin/reservations")
        if (failures.length) return { success: false, error: `${failures.length} fonte(s) falharam; consulte os registros de sincronização.` }
        return { success: true, data: {
            sourcesProcessed: successful.length,
            totalImported: successful.reduce((total, entry) => total + (entry.ok ? entry.result.imported : 0), 0),
        } }
    } catch (error) {
        return { success: false, error: "Erro ao executar sincronização" }
    }
}
