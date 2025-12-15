import { HTTP_STATUS } from "../../../lib/constants";

export function GET(_request: Request): Response {
  const payload = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    status: HTTP_STATUS.OK,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

