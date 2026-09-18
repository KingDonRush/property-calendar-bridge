"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SyncButton() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    async function handleSync() {
        setIsLoading(true)
        setMessage(null)

        try {
            const response = await fetch("/api/admin/sync", { method: "POST" })

            if (response.status === 401) {
                window.location.href = "/login"
                return
            }

            if (!response.ok) {
                const body = await response.json().catch(() => null)
                setMessage(body?.message ?? "Falha ao sincronizar")
                return
            }

            setMessage("Sincronização concluída!")
            router.refresh()
        } catch (error) {
            setMessage("Erro de conexão")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <Button
                onClick={handleSync}
                disabled={isLoading}
                data-ui="sync-button"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Play className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Sincronizando..." : "Sync Now"}
            </Button>
            {message && (
                <span className="text-sm text-slate-600 dark:text-slate-400" data-ui="sync-message">
                    {message}
                </span>
            )}
        </div>
    )
}
