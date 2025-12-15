import ical, { ICalCalendarMethod } from "ical-generator";

import { BookingStatus, type Booking, type Property } from "../models/types";

function bookingSummary(booking: Booking): string {
  switch (booking.status) {
    case BookingStatus.Cancelled:
      return "Cancelado";
    case BookingStatus.Blocked:
      return "Bloqueado";
    case BookingStatus.Tentative:
      return "Reservado";
    case BookingStatus.Confirmed:
    default:
      return "Reservado";
  }
}

export function generateCalendar(bookings: Booking[], propertyInfo: Property): string {
  const calendar = ical({
    name: propertyInfo.name
  });

  calendar.method(ICalCalendarMethod.PUBLISH);
  calendar.timezone(propertyInfo.timezone);

  for (const booking of bookings) {
    calendar.createEvent({
      id: booking.uid,
      uid: booking.uid,
      start: new Date(booking.start_date),
      end: new Date(booking.end_date),
      summary: bookingSummary(booking)
    });
  }

  return calendar.toString();
}
