declare module "node-ical" {
  export type ParsedIcsComponent = Record<string, unknown> & {
    type?: string;
  };

  export function parseICS(data: string): Record<string, ParsedIcsComponent>;
}

