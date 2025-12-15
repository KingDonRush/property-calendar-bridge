import { errorResponse, wrapApiHandler } from "../../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../../lib/ui-auth/guard";
import { generateBackupJSON } from "../../../../../lib/data/backup";

function getAppVersion(): string {
  const fromEnv = process.env.npm_package_version;
  return typeof fromEnv === "string" && fromEnv.trim().length > 0 ? fromEnv : "0.0.0";
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  try {
    const now = new Date();
    const json = await generateBackupJSON({ appVersion: getAppVersion(), now: () => now });
    const filename = `backup-${formatDateForFilename(now)}.json`;

    return new Response(json, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename=\"${filename}\"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(500, error instanceof Error ? error.message : "Failed to export backup", "EXPORT_FAILED");
  }
}

export const GET = wrapApiHandler(unsafeGET);

