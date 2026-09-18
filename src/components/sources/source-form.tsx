"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createSource, updateSource, testSourceConnection, type Source } from "@/app/admin/sources/actions"

interface SourceFormProps {
    source?: Source
    onSuccess?: () => void
    onCancel?: () => void
}

export function SourceForm({ source, onSuccess, onCancel }: SourceFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isTesting, setIsTesting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [testResult, setTestResult] = useState<{ valid: boolean; events?: number } | null>(null)

    const isEditing = !!source

    async function handleTestConnection(formData: FormData) {
        const url = formData.get("source_url") as string
        if (!url) {
            setError("Digite uma URL para testar")
            return
        }

        setIsTesting(true)
        setTestResult(null)
        setError(null)

        const result = await testSourceConnection(url)

        setIsTesting(false)
        if (result.success && result.data) {
            setTestResult(result.data)
        } else {
            setError(result.error ?? "Erro ao testar conexão")
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        setError(null)

        const result = isEditing
            ? await updateSource(source.id, formData)
            : await createSource(formData)

        setIsSubmitting(false)

        if (!result.success) {
            setError(result.error ?? "Erro ao salvar")
            return
        }

        router.refresh()
        onSuccess?.()
    }

    return (
        <Card className="w-full max-w-lg" data-ui="source-form">
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Fonte" : "Nova Fonte"}</CardTitle>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    {!isEditing && (
                        <div className="space-y-2">
                            <Label htmlFor="property_id">ID da Propriedade *</Label>
                            <Input
                                id="property_id"
                                name="property_id"
                                placeholder="ex: casa-praia-01"
                                required
                                data-ui="input-property-id"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="source_url">URL da Fonte (iCal) *</Label>
                        <div className="flex gap-2">
                            <Input
                                id="source_url"
                                name="source_url"
                                type="url"
                                placeholder="https://exemplo.com/calendar.ics"
                                defaultValue={source?.source_url}
                                required
                                className="flex-1"
                                data-ui="input-source-url"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={isTesting}
                                onClick={(e) => {
                                    const form = e.currentTarget.closest("form")
                                    if (form) handleTestConnection(new FormData(form))
                                }}
                                data-ui="test-connection-btn"
                            >
                                {isTesting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Wifi className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {testResult && (
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="success">
                                    <Wifi className="h-3 w-3 mr-1" />
                                    Conectado
                                </Badge>
                                <span className="text-xs text-slate-500">
                                    {testResult.events} evento(s) encontrado(s)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="source_name">Nome da Fonte</Label>
                        <Input
                            id="source_name"
                            name="source_name"
                            placeholder="ex: Airbnb, Booking, etc."
                            defaultValue={source?.source_name ?? ""}
                            data-ui="input-source-name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="refresh_rate">Taxa de Atualização (minutos)</Label>
                        <Input
                            id="refresh_rate"
                            name="refresh_rate"
                            type="number"
                            min="0"
                            defaultValue={source?.refresh_rate ?? 60}
                            data-ui="input-refresh-rate"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            isEditing ? "Salvar Alterações" : "Criar Fonte"
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
