import { getSyncLogs } from "./actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SyncLogsTable } from "@/components/sync/sync-logs-table"
import { SyncActions } from "@/components/sync/sync-actions"

export default async function SyncRunsPage() {
    const result = await getSyncLogs(50)
    const logs = result.success ? (result.data ?? []) : []

    return (
        <div className="space-y-6" data-ui="sync-runs-page">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-50">
                    Histórico de Sincronizações
                </h2>
                <SyncActions />
            </div>

            <Card data-ui="sync-logs-card">
                <CardHeader>
                    <CardTitle>Logs de Sincronização ({logs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <SyncLogsTable logs={logs} />
                </CardContent>
            </Card>
        </div>
    )
}
