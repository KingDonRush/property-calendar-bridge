import { getAllBookings, getAllMappings, getAllSources } from "./repositories";

export type SystemState = {
  sources: unknown[];
  bookings: unknown[];
  mappings: unknown[];
};

export async function fetchAllSystemState(): Promise<SystemState> {
  const [sources, bookings, mappings] = await Promise.all([
    getAllSources(),
    getAllBookings(),
    getAllMappings()
  ]);

  return { sources, bookings, mappings };
}

