import http from "node:http";

import { GET as healthGet } from "./app/api/health/route.js";
import { GET as icalGet } from "./app/api/ical/[secret]/master.ics/route.js";
import { POST as authLoginPost } from "./app/api/auth/login/route.js";
import { POST as authLogoutPost } from "./app/api/auth/logout/route.js";
import { GET as adminSourcesGet, POST as adminSourcesPost } from "./app/api/admin/sources/route.js";
import { DELETE as adminSourcesIdDelete, PUT as adminSourcesIdPut } from "./app/api/admin/sources/[id]/route.js";
import { POST as adminSourcesTestPost } from "./app/api/admin/sources/test/route.js";
import { GET as adminSyncRunsGet } from "./app/api/admin/sync-runs/route.js";
import { GET as adminBookingsGet } from "./app/api/admin/bookings/route.js";
import { POST as adminSyncPost } from "./app/api/admin/sync/route.js";
import { GET as adminAuditGet } from "./app/api/admin/audit/route.js";
import { GET as adminBackupExportGet } from "./app/api/admin/backup/export/route.js";
import { POST as adminBackupValidatePost } from "./app/api/admin/backup/validate/route.js";
import { POST as jobsSyncPost } from "./app/api/jobs/sync/route.js";
import { requireAdminSession } from "./lib/ui-auth/guard.js";
import { renderLoginPage } from "./ui/pages/login.js";
import { MAIN_CSS } from "./ui/styles/mainCss.js";
import { MOBILE_JS } from "./ui/public/client.js";
import { renderLayout } from "./ui/components/Layout.js";
import { renderDashboardPage } from "./ui/pages/Dashboard.js";
import { renderSourcesPage } from "./ui/pages/sources.js";
import { renderSyncRunsPage } from "./ui/pages/sync-runs.js";
import { renderBookingsPage } from "./ui/pages/bookings.js";
import { renderAuditPage } from "./ui/pages/audit.js";
import { renderSettingsPage } from "./ui/pages/settings.js";





function normalizeHeaders(headers: http.IncomingHttpHeaders): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.join(", ");
    }
  }

  return normalized;
}

async function readBody(nodeRequest: http.IncomingMessage): Promise<Buffer | undefined> {
  const method = (nodeRequest.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    nodeRequest.on("data", (chunk) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    nodeRequest.on("end", () => {
      const body = Buffer.concat(chunks);
      resolve(body.length > 0 ? body : undefined);
    });
    nodeRequest.on("error", reject);
  });
}

async function sendResponse(nodeResponse: http.ServerResponse, response: Response): Promise<void> {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));

  const body = Buffer.from(await response.arrayBuffer());
  nodeResponse.end(body);
}

export async function handler(
  nodeRequest: http.IncomingMessage,
  nodeResponse: http.ServerResponse
): Promise<void> {
  const host = nodeRequest.headers.host ?? "localhost";
  const url = new URL(nodeRequest.url ?? "/", `http://${host}`);
  const method = (nodeRequest.method ?? "GET").toUpperCase();

  const body = await readBody(nodeRequest);
  const request = new Request(url.toString(), {
    method,
    headers: normalizeHeaders(nodeRequest.headers),
    body: body ? new Uint8Array(body) : undefined,
  });

  if (method === "GET" && url.pathname === "/login") {
    return sendResponse(
      nodeResponse,
      new Response(renderLoginPage(), {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (method === "GET" && url.pathname === "/assets/main.css") {
    return sendResponse(
      nodeResponse,
      new Response(MAIN_CSS, {
        status: 200,
        headers: { "content-type": "text/css; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (method === "GET" && url.pathname === "/assets/client.js") {
    return sendResponse(
      nodeResponse,
      new Response(MOBILE_JS, {
        status: 200,
        headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    const authResponse = requireAdminSession(request);
    if (authResponse) return sendResponse(nodeResponse, authResponse);

    if (url.pathname === "/admin/sources") {
      const html = renderLayout({
        title: "Fontes",
        activePath: "/admin/sources",
        content: await renderSourcesPage()
      });

      return sendResponse(
        nodeResponse,
        new Response(html, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
        })
      );
    }

    if (url.pathname === "/admin/sync-runs") {
      const html = renderLayout({
        title: "Histórico de Sincronização",
        activePath: "/admin",
        content: await renderSyncRunsPage(),
      });

      return sendResponse(
        nodeResponse,
        new Response(html, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        })
      );
    }


  }

  if (url.pathname === "/admin/bookings") {
    const html = renderLayout({
      title: "Reservas",
      activePath: "/admin",
      content: await renderBookingsPage(url.searchParams),
    });

    return sendResponse(
      nodeResponse,
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (url.pathname === "/admin/audit") {
    const html = renderLayout({
      title: "Logs de Auditoria",
      activePath: "/admin",
      content: await renderAuditPage(url.searchParams),
    });

    return sendResponse(
      nodeResponse,
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (url.pathname === "/admin/settings") {
    const html = renderLayout({
      title: "Configurações",
      activePath: "/admin", // Poderia ser /admin/settings mas o layout talvez não destaque nada se não estiver no menu.
      content: await renderSettingsPage(),
    });

    return sendResponse(
      nodeResponse,
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  // Dashboard (Home do Admin)
  if (url.pathname === "/admin" || url.pathname === "/admin/" || url.pathname === "/admin/dashboard") {
    const html = renderLayout({
      title: "Dashboard",
      activePath: "/admin",
      content: await renderDashboardPage()
    });

    return sendResponse(
      nodeResponse,
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }



  if (method === "POST" && url.pathname === "/api/auth/login") {
    return sendResponse(nodeResponse, await authLoginPost(request));
  }

  if (method === "POST" && url.pathname === "/api/auth/logout") {
    return sendResponse(nodeResponse, await authLogoutPost(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/sources") {
    return sendResponse(nodeResponse, await adminSourcesGet(request));
  }
  if (method === "POST" && url.pathname === "/api/admin/sources") {
    return sendResponse(nodeResponse, await adminSourcesPost(request));
  }

  if (method === "POST" && url.pathname === "/api/admin/sources/test") {
    return sendResponse(nodeResponse, await adminSourcesTestPost(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/sync-runs") {
    return sendResponse(nodeResponse, await adminSyncRunsGet(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/bookings") {
    return sendResponse(nodeResponse, await adminBookingsGet(request));
  }

  if (method === "POST" && url.pathname === "/api/admin/sync") {
    return sendResponse(nodeResponse, await adminSyncPost(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/audit") {
    return sendResponse(nodeResponse, await adminAuditGet(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/backup/export") {
    return sendResponse(nodeResponse, await adminBackupExportGet(request));
  }

  if (method === "POST" && url.pathname === "/api/admin/backup/validate") {
    return sendResponse(nodeResponse, await adminBackupValidatePost(request));
  }

  const adminSourcesIdMatch = url.pathname.match(/^\/api\/admin\/sources\/([^/]+)$/);
  if (adminSourcesIdMatch) {
    const id = adminSourcesIdMatch[1] ?? "";
    if (method === "PUT") {
      return sendResponse(nodeResponse, await adminSourcesIdPut(request, { params: Promise.resolve({ id }) }));
    }
    if (method === "DELETE") {
      return sendResponse(nodeResponse, await adminSourcesIdDelete(request, { params: Promise.resolve({ id }) }));
    }
  }

  if (method === "GET" && url.pathname === "/api/health") {
    return sendResponse(nodeResponse, await healthGet(request));
  }

  const icalMatch = url.pathname.match(/^\/api\/ical\/([^/]+)\/master\.ics$/);
  if (method === "GET" && icalMatch) {
    const secret = icalMatch[1] ?? "";
    return sendResponse(nodeResponse, await icalGet(request, { params: Promise.resolve({ secret }) }));
  }

  if (method === "POST" && url.pathname === "/api/jobs/sync") {
    return sendResponse(nodeResponse, await jobsSyncPost(request));
  }

  if (url.pathname.startsWith("/admin/") || url.pathname === "/admin") {
    const html = renderLayout({
      title: "Página não encontrada",
      activePath: "/admin",
      content: `<div class="card">
          <h1>404 - Página não encontrada</h1>
          <p>A página que você está procurando não existe.</p>
          <a href="/admin" class="btn">Voltar para o Dashboard</a>
        </div>`
    });
    return sendResponse(
      nodeResponse,
      new Response(html, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  nodeResponse.statusCode = 404;
  nodeResponse.setHeader("content-type", "text/plain; charset=utf-8");
  nodeResponse.end("Not Found");
}

export function createHttpServer(): http.Server {
  return http.createServer((req, res) => {
    void handler(req, res);
  });
}
