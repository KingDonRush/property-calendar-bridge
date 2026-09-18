export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
                <h1 className="text-5xl font-bold text-white mb-4">
                    Simple Property Manager
                </h1>
                <p className="text-xl text-slate-300 mb-8">
                    Sistema de gerenciamento de propriedades
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-lg">
                    ✅ Next.js + Tailwind CSS configurado com sucesso!
                </div>
            </div>
        </main>
    )
}
