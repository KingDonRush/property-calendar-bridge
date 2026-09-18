import { Loader2 } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]" data-ui="admin-loading">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
            </div>
        </div>
    )
}
