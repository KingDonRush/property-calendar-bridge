import { getBookings, getBookingStats, type BookingsFilters as BookingFilterValues } from "./actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookingsTable } from "@/components/bookings/bookings-table"
import { BookingsFilters } from "@/components/bookings/bookings-filters"
import { StatCard } from "@/components/dashboard/stat-card"
import { Calendar, CalendarCheck, CalendarClock } from "lucide-react"

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReservationsPage({ searchParams }: PageProps) {
    const params = await searchParams

    const filters: BookingFilterValues = {
        startDate: typeof params.startDate === "string" ? params.startDate : undefined,
        endDate: typeof params.endDate === "string" ? params.endDate : undefined,
        status: typeof params.status === "string" ? params.status : undefined,
        propertyId: typeof params.propertyId === "string" ? params.propertyId : undefined,
    }

    const [bookingsResult, statsResult] = await Promise.all([
        getBookings(filters),
        getBookingStats(),
    ])

    const bookings = bookingsResult.success ? (bookingsResult.data ?? []) : []
    const stats = statsResult.success ? statsResult.data : { total: 0, active: 0, upcoming: 0 }

    return (
        <div className="space-y-6" data-ui="reservations-page">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                    Reservas
                </h2>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Total de Reservas"
                    value={stats?.total ?? 0}
                    icon={Calendar}
                    data-ui="stat-total"
                />
                <StatCard
                    title="Reservas Ativas"
                    value={stats?.active ?? 0}
                    icon={CalendarCheck}
                    description="Hóspedes no momento"
                    data-ui="stat-active"
                />
                <StatCard
                    title="Próximas"
                    value={stats?.upcoming ?? 0}
                    icon={CalendarClock}
                    description="Chegadas futuras"
                    data-ui="stat-upcoming"
                />
            </div>

            {/* Filters */}
            <BookingsFilters />

            {/* Table */}
            <Card data-ui="bookings-list-card">
                <CardHeader>
                    <CardTitle>Lista de Reservas ({bookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <BookingsTable bookings={bookings} />
                </CardContent>
            </Card>
        </div>
    )
}
