"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Admin Error:", error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[400px]" data-ui="admin-error">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <CardTitle>Algo deu errado</CardTitle>
                    <CardDescription>
                        Ocorreu um erro ao carregar esta página.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        {error.message || "Erro desconhecido"}
                    </p>
                    {error.digest && (
                        <p className="text-xs text-slate-400 text-center mt-2">
                            ID: {error.digest}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={reset} data-ui="retry-button">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
