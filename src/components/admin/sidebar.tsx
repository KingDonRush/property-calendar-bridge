"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Settings, RefreshCw, FileText, Link2, Menu, X } from "lucide-react"
import { cn } from "@/components/lib/utils"

const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/reservations", label: "Reservas", icon: Calendar },
    { href: "/admin/sources", label: "Fontes", icon: Link2 },
    { href: "/admin/sync-runs", label: "Sincronizações", icon: RefreshCw },
    { href: "/admin/audit", label: "Auditoria", icon: FileText },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Fechar sidebar ao navegar (mobile)
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Fechar sidebar ao clicar fora
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 1024) {
                setIsOpen(false)
            }
        }
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    // Prevenir scroll do body quando sidebar está aberta
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    return (
        <>
            {/* Botão Hambúrguer - Mobile Only */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-800 text-white shadow-lg"
                data-ui="mobile-menu-button"
                aria-label="Abrir menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Overlay - Mobile Only */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                    data-ui="sidebar-overlay"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen w-64 border-r border-slate-700 bg-slate-950 transition-transform duration-300 ease-in-out",
                    // Mobile: slide in/out
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: sempre visível
                    "lg:translate-x-0"
                )}
                data-ui="admin-sidebar"
            >
                <div className="flex h-16 items-center justify-between border-b border-slate-700 px-6">
                    <Link href="/admin" className="flex items-center gap-2" data-ui="sidebar-logo">
                        <span className="text-lg font-semibold text-slate-50">
                            Calendar Bridge
                        </span>
                    </Link>
                    {/* Botão Fechar - Mobile Only */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1 rounded text-slate-400 hover:text-white"
                        aria-label="Fechar menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex flex-col gap-1 p-4" data-ui="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                                    // Padding maior no mobile para facilitar toque
                                    isActive
                                        ? "bg-slate-800 text-slate-50"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-50"
                                )}
                                data-ui={`sidebar-link-${item.label.toLowerCase()}`}
                                data-state={isActive ? "active" : "inactive"}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    )
}
