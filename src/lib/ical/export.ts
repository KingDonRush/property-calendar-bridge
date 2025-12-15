import ical, { ICalCalendarMethod } from "ical-generator";

import type { Booking, Property } from "../models/types";

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
      summary: "Reserved"
    });
  }

  return calendar.toString();
}
