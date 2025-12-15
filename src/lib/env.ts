export function getEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value === "") {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export function getCronSecretToken(): string {
  return getEnv("CRON_SECRET_TOKEN");
}

export function getIcalMasterSecret(): string {
  return getEnv("ICAL_MASTER_SECRET");
}

