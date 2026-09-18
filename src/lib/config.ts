import { getEnv } from "./env.js";

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

export function getAuthConfig(): Pick<AppConfig, "adminUiToken" | "adminUiSessionSecret"> {
  const adminUiToken = getEnv("ADMIN_UI_TOKEN");
  const adminUiSessionSecret = process.env.SESSION_SECRET || adminUiToken;

  return { adminUiToken, adminUiSessionSecret };
}

export function getDatabaseConfig(): Pick<AppConfig, "supabaseUrl" | "supabaseKey"> {
  return {
    supabaseUrl: getEnvWithFallback("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseKey: process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"),
  };
}

export function getConfig(): AppConfig {
  return {
    ...getAuthConfig(),
    ...getDatabaseConfig(),
    icalMasterSecret: getEnvWithFallback("ICAL_MASTER_SECRET", "MASTER_ICS_SECRET"),
    cronSecretToken: getEnvWithFallback("CRON_SECRET_TOKEN", "JOBS_TOKEN"),
  };
}

export function assertValidEnv(): void {
  getConfig();
}
