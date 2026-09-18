import { requireAdminAction } from "../../lib/ui-auth/next.js"
import { Sidebar } from "@/components/admin/sidebar"
import { TopNav } from "@/components/admin/top-nav"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    await requireAdminAction()
    return (
        <div className="min-h-screen bg-slate-900">
            <Sidebar />
            <TopNav />
            {/* Main content - responsivo */}
            <main
                className="lg:ml-64 pt-20 lg:pt-[80px] px-4 pb-6 lg:p-6"
                data-ui="admin-main"
            >
                {children}
            </main>
        </div>
    )
}
