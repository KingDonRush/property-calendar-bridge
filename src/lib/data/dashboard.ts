import { requireAdminAction } from "../ui-auth/next.js"
import { getSupabaseClient } from "@/lib/supabase/client"

export type DashboardHealth = {
    status: "ok" | "error"
    timestamp: string
}

export type DashboardSyncRun = {
    id: string
    startedAt: string
    finishedAt?: string
    status: string
    sourcesProcessed?: number
    eventsCreated?: number
}

export type DashboardStats = {
    health: DashboardHealth
    sourcesCount: number
    lastSyncRun: DashboardSyncRun | null
    recentSyncs: DashboardSyncRun[]
}

function parseSyncRun(raw: Record<string, unknown>): DashboardSyncRun | null {
    const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "")
    const startedAt = typeof raw.started_at === "string" ? raw.started_at : ""
    const finishedAt = typeof raw.finished_at === "string" ? raw.finished_at : undefined
    const status = typeof raw.status === "string" ? raw.status : "unknown"
    const sourcesProcessed = typeof raw.sources_processed === "number" ? raw.sources_processed : undefined
    const imported = (raw.log_summary as Record<string, unknown> | null)?.imported
    const eventsCreated = typeof imported === "number" ? imported : undefined

    if (!id || !startedAt) return null

    return { id, startedAt, finishedAt, status, sourcesProcessed, eventsCreated }
}

export async function getDashboardData(): Promise<DashboardStats> {
    await requireAdminAction()
    const now = new Date().toISOString()

    try {
        const supabase = getSupabaseClient()

        // Buscar contagem de fontes
        const { count: sourcesCount, error: sourcesError } = await supabase
            .from("channel_sources")
            .select("*", { count: "exact", head: true })

        if (sourcesError) {
            console.error("Erro ao buscar fontes:", sourcesError)
        }

        // Buscar sync runs recentes
        const { data: syncRuns, error: syncsError } = await supabase
            .from("sync_runs")
            .select("*")
            .order("started_at", { ascending: false })
            .limit(5)

        if (syncsError) {
            console.error("Erro ao buscar sync runs:", syncsError)
        }

        const parsedSyncs = (syncRuns ?? [])
            .map((run) => parseSyncRun(run as Record<string, unknown>))
            .filter((s): s is DashboardSyncRun => s !== null)

        return {
            health: { status: sourcesError || syncsError ? "error" : "ok", timestamp: now },
            sourcesCount: sourcesCount ?? 0,
            lastSyncRun: parsedSyncs[0] ?? null,
            recentSyncs: parsedSyncs,
        }
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
        return {
            health: { status: "error", timestamp: now },
            sourcesCount: 0,
            lastSyncRun: null,
            recentSyncs: [],
        }
    }
}
