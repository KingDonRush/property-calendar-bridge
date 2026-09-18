"use server"

import { getSupabaseClient } from "../../../lib/data/supabase.js"
import { requireAdminAction } from "../../../lib/ui-auth/next.js"

// Types
export type AuditLog = {
    id: string
    action: string
    entity: string
    entityId?: string
    details?: Record<string, unknown>
    createdAt: string
    userId?: string
}

export type ActionResult<T = void> = {
    success: boolean
    error?: string
    data?: T
}


function parseAuditLog(raw: Record<string, unknown>): AuditLog | null {
    const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "")
    const action = typeof raw.action === "string" ? raw.action : "unknown"
    const entity = typeof raw.table_name === "string" ? raw.table_name : "unknown"
    const entityId = typeof raw.record_id === "string" ? raw.record_id : undefined
    const createdAt = typeof raw.created_at === "string" ? raw.created_at : ""
    const userId = typeof raw.changed_by === "string" ? raw.changed_by : undefined
    const details = typeof raw.new_data === "object" && raw.new_data !== null
        ? raw.new_data as Record<string, unknown>
        : undefined

    if (!id || !createdAt) return null

    return { id, action, entity, entityId, details, createdAt, userId }
}

export async function getAuditLogs(limit = 50, offset = 0): Promise<ActionResult<AuditLog[]>> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from("audit_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            return { success: false, error: error.message }
        }

        const logs = (data ?? [])
            .map((row) => parseAuditLog(row as Record<string, unknown>))
            .filter((log): log is AuditLog => log !== null)

        return { success: true, data: logs }
    } catch (error) {
        return { success: false, error: "Erro ao buscar logs de auditoria" }
    }
}

export async function getAuditLogStats(): Promise<ActionResult<{ total: number; today: number }>> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()
        const today = new Date().toISOString().split("T")[0]

        const { count: total, error: totalError } = await supabase
            .from("audit_logs")
            .select("*", { count: "exact", head: true })

        const { count: todayCount, error: todayCountError } = await supabase
            .from("audit_logs")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today)

        if (totalError || todayCountError) throw new Error("Database query failed")

        return {
            success: true,
            data: { total: total ?? 0, today: todayCount ?? 0 }
        }
    } catch (error) {
        return { success: false, error: "Erro ao buscar estatísticas" }
    }
}
