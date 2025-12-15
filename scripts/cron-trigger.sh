#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PUBLIC_URL:-}" ]]; then
  echo "Missing required env var: PUBLIC_URL" >&2
  exit 1
fi

TOKEN="${CRON_SECRET_TOKEN:-${JOBS_TOKEN:-}}"
if [[ -z "${TOKEN}" ]]; then
  echo "Missing required env var: CRON_SECRET_TOKEN (or JOBS_TOKEN)" >&2
  exit 1
fi

BASE_URL="${PUBLIC_URL%/}"

curl -fsS -X POST "${BASE_URL}/api/jobs/sync" \
  -H "Authorization: Bearer ${TOKEN}"

