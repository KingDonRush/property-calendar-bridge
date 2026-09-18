import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, User } from "lucide-react"
import type { AuditLog } from "@/app/admin/audit/actions"

interface AuditLogsTableProps {
    logs: AuditLog[]
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

function getActionVariant(action: string): "default" | "success" | "warning" | "destructive" | "secondary" {
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes("create") || lowerAction.includes("insert")) return "success"
    if (lowerAction.includes("update") || lowerAction.includes("edit")) return "warning"
    if (lowerAction.includes("delete") || lowerAction.includes("remove")) return "destructive"
    return "secondary"
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg mb-2">Nenhum log de auditoria</p>
                <p className="text-sm">Os eventos do sistema aparecerão aqui</p>
            </div>
        )
    }

    return (
        <Table data-ui="audit-logs-table">
            <TableHeader>
                <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Detalhes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                    <TableRow key={log.id} data-ui={`audit-log-${log.id}`}>
                        <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {formatDate(log.createdAt)}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getActionVariant(log.action)}>
                                {log.action}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                            {log.entity}
                        </TableCell>
                        <TableCell>
                            {log.entityId ? (
                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    {log.entityId.slice(0, 8)}...
                                </code>
                            ) : "-"}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                            {log.details ? (
                                <span className="text-xs text-slate-500 truncate block">
                                    {JSON.stringify(log.details).slice(0, 50)}...
                                </span>
                            ) : "-"}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
