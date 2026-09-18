"use client"

import { useRouter } from "next/navigation"
import { LogOut, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/app/(auth)/actions"

export function TopNav() {
    const router = useRouter()

    async function handleLogout() {
        await logout()
    }

    function handleBack() {
        router.back()
    }

    return (
        <header
            className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 border-b border-slate-700 bg-slate-900"
            data-ui="admin-top-nav"
        >
            <div className="flex h-full items-center justify-between px-4 lg:px-6">
                {/* Lado esquerdo - Botão voltar no mobile, título no desktop */}
                <div className="flex items-center gap-3">
                    {/* Botão Voltar - Mobile: visível sempre com espaço para hamburguer */}
                    <button
                        onClick={handleBack}
                        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-10"
                        aria-label="Voltar"
                        data-ui="back-button"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-base lg:text-lg font-semibold text-slate-50">
                        Painel Administrativo
                    </h1>
                </div>

                {/* Lado direito - User info e logout */}
                <div className="flex items-center gap-2 lg:gap-4">
                    <span className="hidden sm:inline text-sm text-slate-400">Admin</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-white gap-1 lg:gap-2"
                        data-ui="logout-button"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Sair</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}
