export type Id = string;
export type IsoDateTimeString = string;

export enum ChannelType {
  ICal = "ical",
  Airbnb = "airbnb",
  Booking = "booking",
  Other = "other"
}

export interface Property {
  id: Id;
  name: string;
  timezone: string;
}

export interface ChannelSource {
  id: Id;
  property_id: Id;
  url: string;
  type: ChannelType;
}

export enum BookingStatus {
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Tentative = "tentative",
  Blocked = "blocked"
}

export interface Booking {
  uid: string;
  start_date: IsoDateTimeString;
  end_date: IsoDateTimeString;
  status: BookingStatus;
}

export interface BookingMapping {
  id: Id;
  source_id: Id;
  source_event_uid: string;
  booking_uid: string;
  created_at: IsoDateTimeString;
}

export enum SyncRunStatus {
  Running = "running",
  Success = "success",
  Partial = "partial",
  Failed = "failed"
}

export interface SyncRun {
  id: Id;
  source_id: Id;
  started_at: IsoDateTimeString;
  finished_at?: IsoDateTimeString;
  status: SyncRunStatus;
  summary?: string;
}

export enum ConflictType {
  Overlap = "overlap"
}

export interface Conflict {
  id: Id;
  type: ConflictType;
  booking_uids: string[];
  detected_at: IsoDateTimeString;
  resolved_at?: IsoDateTimeString;
}

export interface AuditEntry {
  id: Id;
  at: IsoDateTimeString;
  action: string;
  entity_type: string;
  entity_id: Id;
  meta?: Record<string, unknown>;
}

export type SyncResult = {
  run: SyncRun;
  imported: number;
  upserted: number;
  conflicts: number;
};
