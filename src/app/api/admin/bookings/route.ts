import { HTTP_STATUS } from "../../../../lib/constants.js";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper.js";
import { requireAdminSession } from "../../../../lib/ui-auth/guard.js";
import { getAllBookings, listBookings } from "../../../../lib/data/repositories.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function sanitizeBooking(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) return {};

  const record = value;
  const out: Record<string, unknown> = {};

  const id = pickString(record, "id");
  if (id) out.id = id;

  const propertyId = pickString(record, "property_id");
  if (propertyId) out.property_id = propertyId;

  const startDate = pickString(record, "start_date");
  if (startDate) out.start_date = startDate;

  const endDate = pickString(record, "end_date");
  if (endDate) out.end_date = endDate;

  const guestName = pickString(record, "guest_name");
  if (guestName) out.guest_name = guestName;

  const status = pickString(record, "status");
  if (status) out.status = status;

  const createdAt = pickString(record, "created_at");
  if (createdAt) out.created_at = createdAt;

  return out;
}

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const url = new URL(request.url);
  const rangeStart = url.searchParams.get("rangeStart");
  const rangeEnd = url.searchParams.get("rangeEnd");

  if ((rangeStart && !rangeEnd) || (!rangeStart && rangeEnd)) {
    return errorResponse(400, "rangeStart and rangeEnd must be provided together", "BAD_REQUEST");
  }

  const bookings =
    rangeStart && rangeEnd
      ? (await listBookings({ rangeStart, rangeEnd })).map(sanitizeBooking)
      : (await getAllBookings()).map(sanitizeBooking);
  return jsonResponse({ bookings }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);
