"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BookingsFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentStatus = searchParams.get("status") || ""
    const currentStartDate = searchParams.get("startDate") || ""
    const currentEndDate = searchParams.get("endDate") || ""

    function updateFilters(updates: Record<string, string>) {
        const params = new URLSearchParams(searchParams.toString())

        for (const [key, value] of Object.entries(updates)) {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        }

        router.push(`/admin/reservations?${params.toString()}`)
    }

    function clearFilters() {
        router.push("/admin/reservations")
    }

    const hasFilters = currentStatus || currentStartDate || currentEndDate

    return (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg" data-ui="bookings-filters">
            <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs">Data Início</Label>
                <Input
                    id="startDate"
                    type="date"
                    value={currentStartDate}
                    onChange={(e) => updateFilters({ startDate: e.target.value })}
                    className="w-40"
                    data-ui="filter-start-date"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs">Data Fim</Label>
                <Input
                    id="endDate"
                    type="date"
                    value={currentEndDate}
                    onChange={(e) => updateFilters({ endDate: e.target.value })}
                    className="w-40"
                    data-ui="filter-end-date"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status" className="text-xs">Status</Label>
                <select
                    id="status"
                    value={currentStatus}
                    onChange={(e) => updateFilters({ status: e.target.value })}
                    className="h-9 w-40 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                    data-ui="filter-status"
                >
                    <option value="">Todos</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelado</option>
                    <option value="blocked">Bloqueado</option>
                </select>
            </div>

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-500"
                    data-ui="clear-filters"
                >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                </Button>
            )}
        </div>
    )
}
