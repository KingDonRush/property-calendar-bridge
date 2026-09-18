"use client"

import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RefreshButton() {
    const router = useRouter()

    function handleRefresh() {
        router.refresh()
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            data-ui="refresh-button"
        >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
        </Button>
    )
}
