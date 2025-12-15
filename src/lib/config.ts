import { getEnv } from "./env";

export type AppConfig = {
  supabaseUrl: string;
  supabaseKey: string;
  icalMasterSecret: string;
  cronSecretToken: string;
  adminUiToken: string;
  adminUiSessionSecret: string;
};

function getEnvWithFallback(primary: string, fallback: string): string {
  const primaryValue = process.env[primary];
  if (typeof primaryValue === "string" && primaryValue !== "") return primaryValue;

  return getEnv(fallback);
}

export function getConfig(): AppConfig {
  const adminUiToken = getEnv("ADMIN_UI_TOKEN");
  const adminUiSessionSecret = process.env.SESSION_SECRET || adminUiToken;

  return {
    supabaseUrl: getEnv("SUPABASE_URL"),
    supabaseKey: getEnv("SUPABASE_KEY"),
    icalMasterSecret: getEnvWithFallback("ICAL_MASTER_SECRET", "MASTER_ICS_SECRET"),
    cronSecretToken: getEnvWithFallback("CRON_SECRET_TOKEN", "JOBS_TOKEN"),
    adminUiToken,
    adminUiSessionSecret,
  };
}

export function assertValidEnv(): void {
  getConfig();
}
