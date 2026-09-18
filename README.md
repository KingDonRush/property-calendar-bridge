# simplePropertyManager

A single-administrator property calendar application with a Next.js interface,
a shared Node API and a Supabase/Postgres data layer. It imports iCalendar feeds
into property-scoped bookings, records synchronization outcomes and exports a
combined occupancy calendar.

## Data flow

A property owns channel sources. Synchronization fetches a source, parses its
events and reconciles each external UID against that source's mapping. Imported
bookings receive stable source-scoped UUIDs; repeated imports converge and changes
update the mapped booking. Sync runs record success or failure and completed counts.
Sources with `refresh_rate = 0` are excluded from the scheduled job.

The schema stores occupancy dates, so timed iCalendar events are reduced to their
normalized UTC dates. Conflict counts currently compare events within the fetched
batch; they are not a property-wide availability engine. Recurrence expansion,
remote deletion reconciliation and automatic interval scheduling are not implemented.
`refresh_rate` is source metadata plus an enabled/disabled flag; an external cron
invokes the sync endpoint.

## Run

Use Node 22.12+ and npm. Copy `.env.example` to `.env` and supply a development
Supabase project. Apply `supabase/migrations` in filename order. The server database
key needs access under the supplied RLS policies; keep it in `SUPABASE_KEY`, never
in a browser-public environment variable. Historical `NEXT_PUBLIC_*` fallbacks
remain for compatibility but do not provide the required service-role permissions.

```bash
npm ci
npm run dev
```

The Next.js admin interface lives at `/admin`. Login uses `ADMIN_UI_TOKEN`; sessions
are signed with `SESSION_SECRET` (falling back to that token) and expire after seven
days. Every server action checks authentication independently. This is a shared
administrator model, without tenant isolation or per-user roles.

For the legacy Node HTTP interface:

```bash
npm run build
npm start
```

`npm run build:next` / `npm run start:next` build and serve the Next.js interface.
Both use the same repository and sync services. `npm run sync:manual` invokes the
shared job from the command line. `CRON_SECRET_TOKEN` protects the job API;
`ICAL_MASTER_SECRET` protects the combined calendar URL. That URL aggregates all
properties and should only be shared with an intended calendar consumer.

## Verification

```bash
npm run typecheck
npm run test:run
npm run build
npm run build:next
bash scripts/verify-database.sh
```

The database verification creates disposable Postgres/PostgREST containers,
applies the real SQL migrations and tests source isolation, initial imports,
repeat imports, updates, mapping repair, failure records and disabled sources.
It binds its REST port to loopback and removes its containers/volume on exit.
It never reads the application `.env` or accesses a configured Supabase project.
Port 55438 must be available. Docker is required only for that verification.

Unit and HTTP tests cover authentication, expiry, action access, calendar parsing,
repositories, UI rendering and API behavior. The CI workflow also builds both
runtimes. Build-time checks use synthetic configuration and do not validate an
existing deployment or historical data migration.

## Operational boundaries

Booking and mapping writes are separate operations. Deterministic imported IDs
make an interrupted mapping write repairable on retry, but the whole source import
is not transactional. The new source/UID unique index deliberately fails if old
data contains duplicate mappings; inspect and resolve such data before migration.
The admin source fetcher assumes trusted operators and can access URLs reachable
from the server. Restrict network access when deploying it. Audit logging is
best-effort and is not a tamper-proof event ledger.

The Next.js interface and legacy HTTP renderer coexist during migration; see
[frontend migration notes](docs/frontend-migration-prd.txt) for historical context.
The implementation and verification commands above describe the current state.
