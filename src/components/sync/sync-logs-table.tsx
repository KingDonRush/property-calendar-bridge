import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { SyncLog } from "@/app/admin/sync-runs/actions"

interface SyncLogsTableProps {
    logs: SyncLog[]
}

function formatDate(isoString: string): string {
    try {
        return new Date(isoString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    } catch {
        return isoString
    }
}

function formatDuration(ms?: number): string {
    if (!ms) return "-"
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
}

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" {
    switch (status.toLowerCase()) {
        case "success":
        case "completed":
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

export function SyncLogsTable({ logs }: SyncLogsTableProps) {
    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-lg mb-2">Nenhum log de sincronização</p>
                <p className="text-sm">Clique em "Sync Now" para executar uma sincronização</p>
            </div>
        )
    }

    return (
        <Table data-ui="sync-logs-table">
            <TableHeader>
                <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Importados</TableHead>
                    <TableHead>Atualizados</TableHead>
                    <TableHead>Conflitos</TableHead>
                    <TableHead>Erro</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                    <TableRow key={log.id} data-ui={`sync-log-${log.id}`}>
                        <TableCell className="font-medium">
                            {formatDate(log.startedAt)}
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(log.status)}>
                                {log.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500">
                            {formatDuration(log.durationMs)}
                        </TableCell>
                        <TableCell>
                            {log.imported !== undefined ? (
                                <span className="text-emerald-600 dark:text-emerald-400">
                                    +{log.imported}
                                </span>
                            ) : "-"}
                        </TableCell>
                        <TableCell>
                            {log.upserted !== undefined ? (
                                <span className="text-blue-600 dark:text-blue-400">
                                    {log.upserted}
                                </span>
                            ) : "-"}
                        </TableCell>
                        <TableCell>
                            {log.conflicts !== undefined && log.conflicts > 0 ? (
                                <span className="text-amber-600 dark:text-amber-400">
                                    {log.conflicts}
                                </span>
                            ) : "-"}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                            {log.errorMessage ? (
                                <span className="text-red-600 dark:text-red-400 text-xs truncate block">
                                    {log.errorMessage}
                                </span>
                            ) : "-"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
