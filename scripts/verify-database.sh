#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
project="spm-verification-${BASHPID}"
compose=(docker compose -p "$project" -f scripts/test-db.compose.yml)
trap '"${compose[@]}" down -v >/dev/null 2>&1' EXIT
npm run build
"${compose[@]}" up -d --wait db
"${compose[@]}" exec -T db psql -U postgres -v ON_ERROR_STOP=1 -c 'CREATE ROLE service_role NOLOGIN;'
for migration in supabase/migrations/*.sql; do
  "${compose[@]}" exec -T db psql -U postgres -v ON_ERROR_STOP=1 < "$migration"
done
"${compose[@]}" exec -T db psql -U postgres -v ON_ERROR_STOP=1 -c 'GRANT USAGE ON SCHEMA public TO service_role; GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;'
"${compose[@]}" up -d rest
for attempt in {1..30}; do
  if curl -fsS http://127.0.0.1:55438/ >/dev/null; then break; fi
  sleep 1
done
SPM_DISPOSABLE_DATABASE=1 node scripts/database-integration.mjs
