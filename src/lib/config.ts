import { getEnv } from "./env";

export type AppConfig = {
  supabaseUrl: string;
  supabaseKey: string;
  icalMasterSecret: string;
  cronSecretToken: string;
};

function getEnvWithFallback(primary: string, fallback: string): string {
  const primaryValue = process.env[primary];
  if (typeof primaryValue === "string" && primaryValue !== "") return primaryValue;

  return getEnv(fallback);
}

export function getConfig(): AppConfig {
  return {
    supabaseUrl: getEnv("SUPABASE_URL"),
    supabaseKey: getEnv("SUPABASE_KEY"),
    icalMasterSecret: getEnvWithFallback("ICAL_MASTER_SECRET", "MASTER_ICS_SECRET"),
    cronSecretToken: getEnvWithFallback("CRON_SECRET_TOKEN", "JOBS_TOKEN"),
  };
}

export function assertValidEnv(): void {
  getConfig();
}

