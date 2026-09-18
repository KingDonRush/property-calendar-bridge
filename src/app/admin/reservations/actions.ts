"use server"

import { getSupabaseClient } from "../../../lib/data/supabase.js"
import { requireAdminAction } from "../../../lib/ui-auth/next.js"

// Types
export type Booking = {
    id: string
    propertyId: string
    guestName?: string
    startDate: string
    endDate: string
    status: string
    source?: string
    createdAt?: string
}

export type BookingsFilters = {
    startDate?: string
    endDate?: string
    status?: string
    propertyId?: string
}

export type ActionResult<T = void> = {
    success: boolean
    error?: string
    data?: T
}


function parseBooking(raw: Record<string, unknown>): Booking | null {
    const id = typeof raw.id === "string" ? raw.id : String(raw.id ?? "")
    const propertyId = typeof raw.property_id === "string" ? raw.property_id : ""
    const startDate = typeof raw.start_date === "string" ? raw.start_date : ""
    const endDate = typeof raw.end_date === "string" ? raw.end_date : ""
    const status = typeof raw.status === "string" ? raw.status : "unknown"
    const guestName = typeof raw.guest_name === "string" ? raw.guest_name : undefined
    const source = typeof raw.source === "string" ? raw.source : undefined
    const createdAt = typeof raw.created_at === "string" ? raw.created_at : undefined

    if (!id || !startDate || !endDate) return null

    return { id, propertyId, guestName, startDate, endDate, status, source, createdAt }
}

export async function getBookings(filters?: BookingsFilters): Promise<ActionResult<Booking[]>> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()

        let query = supabase
            .from("bookings")
            .select("*")
            .order("start_date", { ascending: false })

        // Apply filters
        if (filters?.startDate) {
            query = query.gte("start_date", filters.startDate)
        }

        if (filters?.endDate) {
            query = query.lte("end_date", filters.endDate)
        }

        if (filters?.status) {
            query = query.eq("status", filters.status)
        }

        if (filters?.propertyId) {
            query = query.eq("property_id", filters.propertyId)
        }

        const { data, error } = await query.limit(100)

        if (error) {
            return { success: false, error: error.message }
        }

        const bookings = (data ?? [])
            .map((row) => parseBooking(row as Record<string, unknown>))
            .filter((b): b is Booking => b !== null)

        return { success: true, data: bookings }
    } catch (error) {
        return { success: false, error: "Erro ao buscar reservas" }
    }
}

export async function getBookingStats(): Promise<ActionResult<{ total: number; active: number; upcoming: number }>> {
    try {
        await requireAdminAction()
        const supabase = getSupabaseClient()
        const today = new Date().toISOString().split("T")[0]

        // Total count
        const { count: total, error: totalError } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })

        // Active (current)
        const { count: active, error: activeError } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .lte("start_date", today)
            .gte("end_date", today)

        // Upcoming
        const { count: upcoming, error: upcomingError } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .gt("start_date", today)

        if (totalError || activeError || upcomingError) throw new Error("Database query failed")

        return {
            success: true,
            data: {
                total: total ?? 0,
                active: active ?? 0,
                upcoming: upcoming ?? 0,
            }
        }
    } catch (error) {
        return { success: false, error: "Erro ao buscar estatísticas" }
    }
}
