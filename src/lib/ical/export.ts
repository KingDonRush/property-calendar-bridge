import ical, { ICalCalendarMethod } from "ical-generator";

import type { Booking, Property } from "../models/types";

export function generateCalendar(_bookings: Booking[], propertyInfo: Property): string {
  const calendar = ical({
    name: propertyInfo.name
  });

  calendar.method(ICalCalendarMethod.PUBLISH);
  calendar.timezone(propertyInfo.timezone);

  return calendar.toString();
}

