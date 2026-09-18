"use client"

import { useState } from "react"
import { Download, Loader2, Copy, Eye, EyeOff, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface BackupCardProps {
    backupUrl: string
}

export function BackupCard({ backupUrl }: BackupCardProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    async function handleDownload() {
        setIsDownloading(true)

        try {
            window.open(backupUrl, "_blank")
        } finally {
            setTimeout(() => setIsDownloading(false), 2000)
        }
    }

    return (
        <Card data-ui="backup-card">
            <CardHeader>
                <CardTitle>Backup do Sistema</CardTitle>
                <CardDescription>
                    Exporte todos os dados (propriedades, reservas, mapeamentos e configurações) em formato JSON.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleDownload} disabled={isDownloading} data-ui="download-backup-btn">
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? "Preparando..." : "Baixar Backup Completo"}
                </Button>
            </CardContent>
        </Card>
    )
}

interface ICalUrlCardProps {
    icalUrl: string
}

export function ICalUrlCard({ icalUrl }: ICalUrlCardProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [copied, setCopied] = useState(false)

    async function handleCopy() {
        if (typeof window === "undefined") return

        try {
            const fullUrl = window.location.origin + icalUrl
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(fullUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } else {
                // Fallback para browsers antigos
                const textArea = document.createElement("textarea")
                textArea.value = fullUrl
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                document.body.removeChild(textArea)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (error) {
            console.error("Falha ao copiar:", error)
        }
    }

    return (
        <Card data-ui="ical-url-card">
            <CardHeader>
                <CardTitle>Master iCal URL</CardTitle>
                <CardDescription>
                    Utilize este link para exportar todas as reservas consolidadas para calendários externos (Google Calendar, etc).
                    Mantenha esta URL secreta.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        type={isVisible ? "text" : "password"}
                        value={icalUrl}
                        readOnly
                        className="font-mono text-sm flex-1"
                        data-ui="ical-url-input"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsVisible(!isVisible)}
                        data-ui="toggle-visibility-btn"
                    >
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        data-ui="copy-url-btn"
                    >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                {copied && (
                    <p className="text-sm text-green-600 dark:text-green-400">URL copiada!</p>
                )}
            </CardContent>
        </Card>
    )
}
