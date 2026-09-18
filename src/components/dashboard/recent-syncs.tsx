import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { DashboardSyncRun } from "@/lib/data/dashboard"

interface RecentSyncsProps {
    syncs: DashboardSyncRun[]
}

function formatDate(isoString: string): string {
    try {
        const date = new Date(isoString)
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    } catch {
        return isoString
    }
}

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
    switch (status.toLowerCase()) {
        case "completed":
        case "success":
            return "success"
        case "running":
        case "in_progress":
            return "warning"
        case "failed":
        case "error":
            return "destructive"
        default:
            return "secondary"
    }
}

export function RecentSyncs({ syncs }: RecentSyncsProps) {
    if (syncs.length === 0) {
        return (
            <div className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">
                Nenhuma sincronização registrada
            </div>
        )
    }

    return (
        <Table data-ui="recent-syncs-table">
            <TableHeader>
                <TableRow>
                    <TableHead>Iniciado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fontes</TableHead>
                    <TableHead>Eventos</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {syncs.map((sync) => (
                    <TableRow key={sync.id} data-ui={`sync-row-${sync.id}`}>
                        <TableCell className="font-medium">
                            {formatDate(sync.startedAt)}
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(sync.status)}>
                                {sync.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{sync.sourcesProcessed ?? "-"}</TableCell>
                        <TableCell>{sync.eventsCreated ?? "-"}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
