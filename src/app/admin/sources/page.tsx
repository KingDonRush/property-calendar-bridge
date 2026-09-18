import { getSources } from "./actions"
import { SourcesPageClient } from "@/components/sources/sources-page-client"

export default async function SourcesPage() {
    const result = await getSources()
    const sources = result.success ? (result.data ?? []) : []

    return <SourcesPageClient initialSources={sources} />
}
