declare module "node-ical" {
  export type ParsedIcsComponent = Record<string, unknown> & {
    type?: string;
  };

  export type NodeIcal = {
    parseICS(data: string): Record<string, ParsedIcsComponent>;
  };

  const nodeIcal: NodeIcal;
  export default nodeIcal;
}
