import { listBookings } from "../data/repositories";

export type UiBooking = {
  id?: string;
  propertyId?: string;
  guestName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function normalizeBooking(raw: unknown): UiBooking {
  if (!isPlainObject(raw)) return {};

  return {
    id: pickString(raw, "id"),
    propertyId: pickString(raw, "property_id"),
    guestName: pickString(raw, "guest_name"),
    startDate: pickString(raw, "start_date"),
    endDate: pickString(raw, "end_date"),
    status: pickString(raw, "status"),
  };
}

export type GetBookingsArgs = {
  rangeStart: string;
  rangeEnd: string;
};

export async function getBookings(args: GetBookingsArgs): Promise<UiBooking[]> {
  try {
    const bookings = await listBookings({ rangeStart: args.rangeStart, rangeEnd: args.rangeEnd });
    if (!Array.isArray(bookings)) return [];
    return bookings.map(normalizeBooking);
  } catch {
    return [];
  }
}

