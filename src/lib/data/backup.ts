import { getAllBookings, getAllMappings, getAllSources } from "./repositories.js";

export type SystemState = {
  sources: unknown[];
  bookings: unknown[];
  mappings: unknown[];
};

export type BackupMeta = {
  schemaVersion: 1;
  appVersion: string;
  createdAt: string;
};

export type BackupFile = {
  meta: BackupMeta;
  data: SystemState;
};

export async function fetchAllSystemState(): Promise<SystemState> {
  const [sources, bookings, mappings] = await Promise.all([
    getAllSources(),
    getAllBookings(),
    getAllMappings()
  ]);

  return { sources, bookings, mappings };
}

export async function generateBackupJSON(options: {
  appVersion: string;
  now?: () => Date;
}): Promise<string> {
  const now = options.now ?? (() => new Date());
  const state = await fetchAllSystemState();

  const backup: BackupFile = {
    meta: {
      schemaVersion: 1,
      appVersion: options.appVersion,
      createdAt: now().toISOString()
    },
    data: state
  };

  return JSON.stringify(backup, null, 2);
}

export function validateBackupFile(jsonContent: string): boolean {
  try {
    const parsed = JSON.parse(jsonContent) as Partial<BackupFile> | null;
    if (!parsed || typeof parsed !== "object") return false;

    const meta: any = (parsed as any).meta;
    const data: any = (parsed as any).data;

    if (!meta || typeof meta !== "object") return false;
    if (meta.schemaVersion !== 1) return false;
    if (typeof meta.appVersion !== "string") return false;
    if (typeof meta.createdAt !== "string") return false;

    if (!data || typeof data !== "object") return false;
    if (!Array.isArray(data.bookings)) return false;
    if (!Array.isArray(data.sources)) return false;
    if (!Array.isArray(data.mappings)) return false;

    return true;
  } catch {
    return false;
  }
}
