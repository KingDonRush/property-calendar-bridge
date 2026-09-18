import { getAllBookings } from "../../../../../lib/data/repositories.js";
import { BookingStatus } from "../../../../../lib/models/types.js";
import { HTTP_STATUS } from "../../../../../lib/constants.js";
import { getIcalMasterSecret } from "../../../../../lib/env.js";
import { generateCalendar } from "../../../../../lib/ical/export.js";
import type { Property } from "../../../../../lib/models/types.js";
import { errorResponse, wrapApiHandler } from "../../../../../lib/api/responseHelper.js";

type RouteContext = {
  params: Promise<{ secret: string }>;
};

async function unsafeGET(_request: Request, context: RouteContext): Promise<Response> {
  const expectedSecret = getIcalMasterSecret();
  const providedSecret = (await context.params).secret;

  if (providedSecret !== expectedSecret) {
    return errorResponse(HTTP_STATUS.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED");
  }

  const property: Property = { id: "master", name: "Master", timezone: "UTC" };
  const rows = await getAllBookings();
  const bookings = rows.map((row) => {
    const record = row as Record<string, unknown>;
    return { uid: String(record.id), start_date: String(record.start_date), end_date: String(record.end_date), status: record.status as BookingStatus };
  });
  const calendar = generateCalendar(bookings, property);

  return new Response(calendar, {
    status: HTTP_STATUS.OK,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export const GET = wrapApiHandler(unsafeGET);
