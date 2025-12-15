import { HTTP_STATUS } from "../../../../../lib/constants";
import { getIcalMasterSecret } from "../../../../../lib/env";
import { generateCalendar } from "../../../../../lib/ical/export";
import type { Property } from "../../../../../lib/models/types";

type RouteContext = {
  params: {
    secret: string;
  };
};

export function GET(_request: Request, context: RouteContext): Response {
  const expectedSecret = getIcalMasterSecret();
  const providedSecret = context.params.secret;

  if (providedSecret !== expectedSecret) {
    return new Response("Unauthorized", { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const property: Property = { id: "master", name: "Master", timezone: "UTC" };
  const calendar = generateCalendar([], property);

  return new Response(calendar, {
    status: HTTP_STATUS.OK,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

