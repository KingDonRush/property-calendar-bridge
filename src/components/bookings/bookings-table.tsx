import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Home, User } from "lucide-react"
import type { Booking } from "@/app/admin/reservations/actions"

interface BookingsTableProps {
    bookings: Booking[]
}

function formatDate(isoString: string): string {
    try {
        return new Date(isoString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    } catch {
        return isoString
    }
}

function getStatusVariant(status: string): "success" | "warning" | "destructive" | "secondary" | "default" {
    switch (status.toLowerCase()) {
        case "confirmed":
        case "active":
            return "success"
        case "pending":
            return "warning"
        case "cancelled":
        case "canceled":
            return "destructive"
        case "blocked":
            return "secondary"
        default:
            return "default"
    }
}

function getSourceIcon(source?: string) {
    // Could be extended with specific icons per source
    return <Calendar className="h-4 w-4 text-slate-400" />
}

export function BookingsTable({ bookings }: BookingsTableProps) {
    if (bookings.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg mb-2">Nenhuma reserva encontrada</p>
                <p className="text-sm">As reservas aparecerão aqui após a sincronização</p>
            </div>
        )
    }

    return (
        <Table data-ui="bookings-table">
            <TableHeader>
                <TableRow>
                    <TableHead>Propriedade</TableHead>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fonte</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id} data-ui={`booking-row-${booking.id}`}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-slate-400" />
                                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    {booking.propertyId || "N/A"}
                                </code>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <span>{booking.guestName || "Sem nome"}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium">
                            {formatDate(booking.startDate)}
                        </TableCell>
                        <TableCell className="font-medium">
                            {formatDate(booking.endDate)}
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(booking.status)}>
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {getSourceIcon(booking.source)}
                                <span className="text-sm text-slate-500">
                                    {booking.source || "iCal"}
                                </span>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
