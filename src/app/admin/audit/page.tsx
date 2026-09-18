import { getAuditLogs, getAuditLogStats } from "./actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/stat-card"
import { AuditLogsTable } from "@/components/audit/audit-logs-table"
import { FileText, CalendarDays } from "lucide-react"

export default async function AuditPage() {
    const [logsResult, statsResult] = await Promise.all([
        getAuditLogs(50),
        getAuditLogStats(),
    ])

    const logs = logsResult.success ? (logsResult.data ?? []) : []
    const stats = statsResult.success ? statsResult.data : { total: 0, today: 0 }

    return (
        <div className="space-y-6" data-ui="audit-page">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Logs de Auditoria
                </h2>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                    title="Total de Eventos"
                    value={stats?.total ?? 0}
                    icon={FileText}
                    data-ui="stat-total"
                />
                <StatCard
                    title="Eventos Hoje"
                    value={stats?.today ?? 0}
                    icon={CalendarDays}
                    data-ui="stat-today"
                />
            </div>

            {/* Table */}
            <Card data-ui="audit-logs-card">
                <CardHeader>
                    <CardTitle>Eventos do Sistema ({logs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <AuditLogsTable logs={logs} />
                </CardContent>
            </Card>
        </div>
    )
}
