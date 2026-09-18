"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { login, type LoginResult } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            className="w-full"
            disabled={pending}
            data-ui="login-submit"
        >
            {pending ? "Entrando..." : "Entrar"}
        </Button>
    )
}

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        const result: LoginResult = await login(formData)

        if (!result.success && result.error) {
            setError(result.error)
        }
    }

    return (
        <Card className="w-full max-w-md" data-ui="login-card">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Property Calendar Bridge</CardTitle>
                <CardDescription>Entre com seu token de administrador</CardDescription>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div
                            className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            data-ui="login-error"
                        >
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="token" data-ui="login-label">Token de Acesso</Label>
                        <Input
                            id="token"
                            name="token"
                            type="password"
                            placeholder="Digite seu token..."
                            required
                            autoFocus
                            data-ui="login-input"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    )
}
