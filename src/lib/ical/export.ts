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

function bookingEventUid(booking: Booking): string {
  const externalUid = (booking as any).external_uid ?? (booking as any).source_event_uid;
  if (typeof externalUid === "string" && externalUid.trim()) return externalUid;
  return booking.uid;
}

export function generateCalendar(bookings: Booking[], propertyInfo: Property): string {
  const calendar = ical({
    name: propertyInfo.name,
    prodId: { company: "simplePropertyManager", product: "simplePropertyManager", language: "EN" }
  });

  calendar.method(ICalCalendarMethod.PUBLISH);
  calendar.timezone(propertyInfo.timezone);

  for (const booking of bookings) {
    const uid = bookingEventUid(booking);
    const event = calendar.createEvent({
      id: uid,
      start: new Date(booking.start_date),
      end: new Date(booking.end_date),
      summary: bookingSummary(booking)
    });
    event.uid(uid);
  }

  return calendar.toString();
}
