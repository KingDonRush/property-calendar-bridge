"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SourceForm } from "@/components/sources/source-form"
import { SourcesTable } from "@/components/sources/sources-table"
import type { Source } from "@/app/admin/sources/actions"

interface SourcesPageClientProps {
    initialSources: Source[]
}

export function SourcesPageClient({ initialSources }: SourcesPageClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editingSource, setEditingSource] = useState<Source | null>(null)

    function handleAddClick() {
        setEditingSource(null)
        setShowForm(true)
    }

    function handleEditClick(source: Source) {
        setEditingSource(source)
        setShowForm(true)
    }

    function handleFormSuccess() {
        setShowForm(false)
        setEditingSource(null)
    }

    function handleFormCancel() {
        setShowForm(false)
        setEditingSource(null)
    }

    return (
        <div className="space-y-6" data-ui="sources-page">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Fontes de Dados
                </h2>
                <Button onClick={handleAddClick} data-ui="add-source-btn">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Fonte
                </Button>
            </div>

            {showForm && (
                <div className="flex justify-center">
                    <SourceForm
                        source={editingSource ?? undefined}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                </div>
            )}

            <Card data-ui="sources-list-card">
                <CardHeader>
                    <CardTitle>Fontes Cadastradas ({initialSources.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <SourcesTable sources={initialSources} onEdit={handleEditClick} />
                </CardContent>
            </Card>
        </div>
    )
}
