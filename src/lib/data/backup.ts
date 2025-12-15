import { getAllBookings, getAllMappings, getAllSources } from "./repositories";

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
