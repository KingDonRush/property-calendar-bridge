import { HTTP_STATUS } from "../../../../lib/constants";
import { getCronSecretToken } from "../../../../lib/env";
import { runSyncJob } from "../../../../lib/jobs/sync";

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function POST(request: Request): Promise<Response> {
  const expectedToken = getCronSecretToken();
  const providedToken = getBearerToken(request);

  if (!providedToken || providedToken !== expectedToken) {
    return new Response("Unauthorized", { status: HTTP_STATUS.UNAUTHORIZED });
  }

  try {
    const result = await runSyncJob();
    return new Response(JSON.stringify(result), {
      status: HTTP_STATUS.OK,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
