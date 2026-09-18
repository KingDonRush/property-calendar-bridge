"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Edit, Loader2, ExternalLink } from "lucide-react"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteSource, type Source } from "@/app/admin/sources/actions"

interface SourcesTableProps {
    sources: Source[]
    onEdit?: (source: Source) => void
}

function formatDate(isoString: string | null): string {
    if (!isoString) return "Nunca"
    try {
        return new Date(isoString).toLocaleString("pt-BR", {
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

function SourceRow({ source, onEdit }: { source: Source; onEdit?: (source: Source) => void }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm(`Deseja realmente desativar a fonte "${source.source_name || source.id}"?`)) {
            return
        }

        setIsDeleting(true)
        await deleteSource(source.id)
        router.refresh()
    }

    const isActive = source.refresh_rate > 0

    return (
        <TableRow data-ui={`source-row-${source.id}`}>
            <TableCell className="font-medium">
                {source.source_name || (
                    <span className="text-slate-400 italic">Sem nome</span>
                )}
            </TableCell>
            <TableCell>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {source.property_id}
                </code>
            </TableCell>
            <TableCell>
                <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm truncate max-w-[200px]"
                >
                    {new URL(source.source_url).hostname}
                    <ExternalLink className="h-3 w-3" />
                </a>
            </TableCell>
            <TableCell>
                <Badge variant={isActive ? "success" : "secondary"}>
                    {isActive ? `${source.refresh_rate}min` : "Inativo"}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-slate-500">
                {formatDate(source.last_sync_at)}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(source)}
                        data-ui={`edit-btn-${source.id}`}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-ui={`delete-btn-${source.id}`}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

export function SourcesTable({ sources, onEdit }: SourcesTableProps) {
    if (sources.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p className="text-lg mb-2">Nenhuma fonte cadastrada</p>
                <p className="text-sm">Clique em "Nova Fonte" para adicionar</p>
            </div>
        )
    }

    return (
        <Table data-ui="sources-table">
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Propriedade</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Atualização</TableHead>
                    <TableHead>Última Sync</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sources.map((source) => (
                    <SourceRow key={source.id} source={source} onEdit={onEdit} />
                ))}
            </TableBody>
        </Table>
    )
}
