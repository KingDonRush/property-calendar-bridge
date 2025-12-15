import { HTTP_STATUS } from "../../../../lib/constants";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { getAllBookings, listBookings } from "../../../../lib/data/repositories";

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const url = new URL(request.url);
  const rangeStart = url.searchParams.get("rangeStart");
  const rangeEnd = url.searchParams.get("rangeEnd");

  if ((rangeStart && !rangeEnd) || (!rangeStart && rangeEnd)) {
    return errorResponse(400, "rangeStart and rangeEnd must be provided together", "BAD_REQUEST");
  }

  const bookings = rangeStart && rangeEnd ? await listBookings({ rangeStart, rangeEnd }) : await getAllBookings();
  return jsonResponse({ bookings }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);

