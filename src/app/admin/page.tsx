import { getDashboardData } from "@/lib/data/dashboard"
import { StatCard } from "@/components/dashboard/stat-card"
import { RefreshButton } from "@/components/dashboard/refresh-button"
import { SyncButton } from "@/components/dashboard/sync-button"
import { RecentSyncs } from "@/components/dashboard/recent-syncs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, Database, Clock } from "lucide-react"

function formatLastSync(startedAt?: string, status?: string): string {
    if (!startedAt) return "Nunca"

    try {
        const date = new Date(startedAt)
        const formatted = date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
        return status ? `${formatted} (${status})` : formatted
    } catch {
        return startedAt
    }
}

export default async function AdminDashboard() {
    const data = await getDashboardData()

    const lastSyncDescription = data.lastSyncRun
        ? formatLastSync(data.lastSyncRun.startedAt, data.lastSyncRun.status)
        : "Nunca"

    return (
        <div className="space-y-6" data-ui="admin-dashboard">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                        Dashboard
                    </h2>
                    <Badge variant={data.health.status === "ok" ? "success" : "destructive"}>
                        {data.health.status === "ok" ? "Sistema Online" : "Erro"}
                    </Badge>
                </div>
                <RefreshButton />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Status do Sistema"
                    value={data.health.status === "ok" ? "Operacional" : "Erro"}
                    icon={Database}
                    data-ui="stat-health"
                />

                <StatCard
                    title="Total de Fontes"
                    value={data.sourcesCount}
                    icon={Building2}
                    description={`${data.sourcesCount} fonte${data.sourcesCount !== 1 ? "s" : ""} cadastrada${data.sourcesCount !== 1 ? "s" : ""}`}
                    data-ui="stat-sources"
                />

                <StatCard
                    title="Última Sincronização"
                    value={data.lastSyncRun?.status ?? "N/A"}
                    icon={Clock}
                    description={lastSyncDescription}
                    data-ui="stat-last-sync"
                />

                <StatCard
                    title="Sincronizações Recentes"
                    value={data.recentSyncs.length}
                    icon={Calendar}
                    description="Últimas 5 execuções"
                    data-ui="stat-recent-count"
                />
            </div>

            {/* Sync Actions */}
            <Card data-ui="sync-actions-card">
                <CardHeader>
                    <CardTitle>Ações de Sincronização</CardTitle>
                </CardHeader>
                <CardContent>
                    <SyncButton />
                </CardContent>
            </Card>

            {/* Recent Syncs */}
            <Card data-ui="recent-syncs-card">
                <CardHeader>
                    <CardTitle>Sincronizações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <RecentSyncs syncs={data.recentSyncs} />
                </CardContent>
            </Card>
        </div>
    )
}
