# Property Calendar Bridge

A booking-calendar synchronization service that brings external iCalendar feeds
into canonical property bookings and publishes a consolidated occupancy calendar.
It gives an operator a traceable import history: which source supplied an event,
which booking it maps to, what changed and whether synchronization succeeded.

## From source calendars to occupancy

**Property → iCalendar sources → fetch / parse → source-scoped reconciliation →
booking mappings → sync runs → consolidated calendar**

Each property owns channel sources. Synchronization reconciles an external UID
against the mapping for that source, creating, updating or skipping the booking.
Deterministic source-scoped IDs allow repeated imports to converge and interrupted
mapping writes to be repaired on retry. Sync runs preserve outcomes and completed
counts; the master export is generated from persisted bookings.

This is calendar integration infrastructure, rather than a complete property
management suite or a channel manager with pricing/distribution APIs. The separate
[Rental Booking Dashboard](https://github.com/KingDonRush/rental-booking-dashboard)
focuses on apartments, rooms, occupancy and payment operations.

## Operator interface

| Area | Current workflow |
| --- | --- |
| Dashboard | Inspect counts and recent sync activity; trigger synchronization |
| Sources | Add/edit channel URLs, associate a property, test a feed and manage refresh metadata |
| Reservations | Inspect and filter consolidated booking records |
| Sync Runs | Review synchronization status/history and run the shared import job |
| Audit | Inspect recorded administrative events |
| Settings | Access backup operations and configuration information |

The Next.js admin and legacy Node HTTP interface share domain and persistence
services. Manual UI/CLI triggers and the protected job endpoint invoke the same
sync job. Scheduling is provided by an external cron, not an in-process scheduler.

## Architecture

| Component | Responsibility |
| --- | --- |
| [Calendar services](src/lib/ical) | Parse feeds, reconcile source events and export iCalendar |
| [Sync job](src/lib/jobs/sync.ts) | Iterate enabled sources and retain per-source results |
| [Repositories](src/lib/data/repositories.ts) | Supabase/Postgres bookings, mappings, sync runs and audit persistence |
| [SQL migrations](supabase/migrations) | Properties, channel sources, bookings, mappings, conflicts, history and RLS |
| [Next routes](src/app) / [legacy HTTP server](src/httpServer.ts) | Admin operations and authenticated APIs |

## Run locally

Use Node 22.12+ and npm. Copy `.env.example` to `.env` and supply a development
Supabase project. Apply `supabase/migrations` in filename order. The server database
key needs access under the supplied RLS policies; keep it in `SUPABASE_KEY`, never
in a browser-public environment variable. Historical `NEXT_PUBLIC_*` fallbacks
remain for compatibility but do not provide the required service-role permissions.

```bash
git clone https://github.com/KingDonRush/property-calendar-bridge.git
cd property-calendar-bridge
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

## Calendar semantics and compatibility

The schema stores occupancy dates, so timed events are reduced to normalized UTC
dates. Conflict counts compare events within the fetched batch, not all existing
property bookings. Recurrence expansion and remote deletion reconciliation are
not implemented. `refresh_rate` is source metadata plus an enabled/disabled flag;
zero excludes a source from the job, but nonzero values do not schedule intervals.

The internal `simplePropertyManager` seed used for deterministic imported IDs and
the iCalendar `PRODID` are preserved. Existing booking IDs, exported identity,
package name, environment variables and database names do not change with the
repository/product rename.
