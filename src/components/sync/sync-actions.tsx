"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { triggerSync } from "@/app/admin/sync-runs/actions"

interface SyncActionsProps {
    showRefresh?: boolean
}

export function SyncActions({ showRefresh = true }: SyncActionsProps) {
    const router = useRouter()
    const [isSyncing, setIsSyncing] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    async function handleSync() {
        setIsSyncing(true)
        setMessage("Sincronizando...")

        const result = await triggerSync()

        setIsSyncing(false)

        if (result.success && result.data) {
            setMessage(`Concluído: ${result.data.sourcesProcessed} fonte(s), ${result.data.totalImported} evento(s)`)
            router.refresh()
        } else {
            setMessage(result.error ?? "Erro ao sincronizar")
        }

        // Clear message after 5 seconds
        setTimeout(() => setMessage(null), 5000)
    }

    function handleRefresh() {
        router.refresh()
    }

    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
                onClick={handleSync}
                disabled={isSyncing}
                size="sm"
                data-ui="trigger-sync-button"
            >
                {isSyncing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Play className="h-4 w-4 mr-2" />
                )}
                {isSyncing ? "Sincronizando..." : "Sync Now"}
            </Button>

            {showRefresh && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    data-ui="refresh-logs-button"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            )}

            {message && (
                <span
                    className="text-xs sm:text-sm text-slate-400 w-full sm:w-auto"
                    data-ui="sync-message"
                >
                    {message}
                </span>
            )}
        </div>
    )
}
