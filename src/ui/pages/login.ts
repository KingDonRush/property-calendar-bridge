function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderLoginPage(error?: string): string {
  const errorBlock = error
    ? `<div class="error" role="alert">${escapeHtml(error)}</div>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Admin Login</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 24px; background: #0b1020; color: #f2f5ff; }
      .card { max-width: 420px; margin: 10vh auto 0; background: #121a33; border: 1px solid #26315a; border-radius: 12px; padding: 18px; }
      h1 { font-size: 18px; margin: 0 0 12px; }
      label { display: block; font-size: 12px; opacity: 0.9; margin-bottom: 6px; }
      input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #2a3766; background: #0d1530; color: #f2f5ff; }
      button { margin-top: 12px; width: 100%; padding: 10px 12px; border-radius: 10px; border: 0; background: #4f7cff; color: white; font-weight: 600; cursor: pointer; }
      .error { margin-bottom: 12px; padding: 10px 12px; border-radius: 10px; background: #3a1720; border: 1px solid #7a2b3a; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Property Calendar Bridge — Admin</h1>
      ${errorBlock}
      <form method="POST" action="/api/auth/login">
        <label for="token">Token</label>
        <input id="token" name="token" type="password" autocomplete="current-password" required />
        <button type="submit">Entrar</button>
      </form>
    </main>
  </body>
</html>`;
}

