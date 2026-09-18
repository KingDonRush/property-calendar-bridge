import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    outputFileTracingRoot: process.cwd(),
    // Shared server modules keep Node ESM .js specifiers; webpack resolves their TS sources.
    webpack(config) {
        config.resolve.extensionAlias = { ...config.resolve.extensionAlias, ".js": [".ts", ".tsx", ".js"] }
        return config
    },
    // Configurar redirecionamentos de rotas legadas
    async redirects() {
        return [
            // Redirecionar rotas admin legadas para novas rotas Next.js
            {
                source: "/admin/dashboard",
                destination: "/admin",
                permanent: true,
            },
            {
                source: "/admin/bookings",
                destination: "/admin/reservations",
                permanent: true,
            },
        ]
    },

    // Configurar headers para rotas de API
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Cache-Control", value: "no-store" },
                ],
            },
        ]
    },

    // Manter compatibilidade com rotas existentes
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
}

export default nextConfig
