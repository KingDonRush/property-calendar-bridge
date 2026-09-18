"use server"

import { fetchAndParseIcs } from "../../../lib/ical/sync.js"
import { revalidatePath } from "next/cache"
import { getSupabaseClient } from "../../../lib/data/supabase.js"
import { requireAdminAction } from "../../../lib/ui-auth/next.js"

// Types
export type Source = {
    id: string
    property_id: string
    source_url: string
    source_name: string | null
    refresh_rate: number
    last_sync_at: string | null
    created_at: string
}

export type SourceFormData = {
    property_id: string
    source_url: string
    source_name?: string
    refresh_rate?: number
}

export type ActionResult<T = void> = {
    success: boolean
    error?: string
    data?: T
}


// Validations
function isValidHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
        return false
    }
}

// Actions
export async function getSources(): Promise<ActionResult<Source[]>> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from("channel_sources")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: data as Source[] }
    } catch (error) {
        return { success: false, error: "Erro ao buscar fontes" }
    }
}

export async function createSource(formData: FormData): Promise<ActionResult<Source>> {
    try {
        await requireAdminAction()
        const property_id = formData.get("property_id") as string
        const source_url = formData.get("source_url") as string
        const source_name = formData.get("source_name") as string | null
        const refresh_rate = Number(formData.get("refresh_rate") ?? 60)

        if (!Number.isInteger(refresh_rate) || refresh_rate < 0) return { success: false, error: "Intervalo inválido" }
        // Validations
        if (!property_id?.trim()) {
            return { success: false, error: "ID da propriedade é obrigatório" }
        }

        if (!source_url?.trim() || !isValidHttpUrl(source_url)) {
            return { success: false, error: "URL da fonte deve ser uma URL http(s) válida" }
        }

        const supabase = getSupabaseClient()

        const { data, error } = await supabase
            .from("channel_sources")
            .insert({
                property_id: property_id.trim(),
                source_url: source_url.trim(),
                source_name: source_name?.trim() || null,
                refresh_rate,
            })
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath("/admin/sources")
        return { success: true, data: data as Source }
    } catch (error) {
        return { success: false, error: "Erro ao criar fonte" }
    }
}

export async function updateSource(id: string, formData: FormData): Promise<ActionResult> {
    try {
        await requireAdminAction()
        const source_url = formData.get("source_url") as string
        const source_name = formData.get("source_name") as string | null
        const refresh_rate = parseInt(formData.get("refresh_rate") as string)

        const updates: Record<string, unknown> = {}

        if (source_url?.trim()) {
            if (!isValidHttpUrl(source_url)) {
                return { success: false, error: "URL da fonte deve ser uma URL http(s) válida" }
            }
            updates.source_url = source_url.trim()
        }

        if (source_name !== null) {
            updates.source_name = source_name.trim() || null
        }

        if (formData.has("refresh_rate") && (!Number.isInteger(refresh_rate) || refresh_rate < 0)) return { success: false, error: "Intervalo inválido" }
        if (!isNaN(refresh_rate) && refresh_rate >= 0) {
            updates.refresh_rate = refresh_rate
        }

        if (Object.keys(updates).length === 0) {
            return { success: false, error: "Nenhum campo para atualizar" }
        }

        const supabase = getSupabaseClient()

        const { error } = await supabase
            .from("channel_sources")
            .update(updates)
            .eq("id", id)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath("/admin/sources")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao atualizar fonte" }
    }
}

export async function deleteSource(id: string): Promise<ActionResult> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()

        // Soft delete: just set refresh_rate to 0
        const { error } = await supabase
            .from("channel_sources")
            .update({ refresh_rate: 0 })
            .eq("id", id)

        if (error) {
            return { success: false, error: error.message }
        }

        revalidatePath("/admin/sources")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao deletar fonte" }
    }
}

export async function testSourceConnection(url: string): Promise<ActionResult<{ valid: boolean; events?: number }>> {
    try {
        await requireAdminAction()
        if (!isValidHttpUrl(url)) {
            return { success: false, error: "URL inválida" }
        }

        const events = await fetchAndParseIcs(url)
        return { success: true, data: { valid: true, events: events.length } }
    } catch (error) {
        return { success: false, error: "Não foi possível conectar à URL" }
    }
}
