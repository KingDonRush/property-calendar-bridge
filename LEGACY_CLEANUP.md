# Frontend migration status

The Next.js UI and native Node HTTP renderer currently coexist. Both are built
and tested. Shared API handlers, repositories, authentication and sync services
must remain usable by both entry points during migration.

Do not remove `src/ui`, `src/httpServer.ts` or `src/server.ts` until native runtime
support is deliberately retired and its deployment scripts and tests are updated.
Next.js route protection lives in `src/proxy.ts`; individual server actions also
validate the signed session. Layout protection alone is insufficient.
