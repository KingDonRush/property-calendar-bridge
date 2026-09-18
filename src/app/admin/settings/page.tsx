import { BackupCard, ICalUrlCard } from "@/components/settings/settings-cards"

function getICalSecret(): string {
    return process.env.ICAL_MASTER_SECRET || process.env.MASTER_ICS_SECRET || "NOT_CONFIGURED"
}

export default function SettingsPage() {
    const icalSecret = getICalSecret()
    const icalUrl = `/api/ical/${icalSecret}/master.ics`
    const backupUrl = "/api/admin/backup/export"

    return (
        <div className="space-y-6" data-ui="settings-page">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Configurações
                </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <BackupCard backupUrl={backupUrl} />
                <ICalUrlCard icalUrl={icalUrl} />
            </div>
        </div>
    )
}
