export interface TransportRuntime {
  id: string;
  type: 'REST' | 'MCP' | 'Browser' | 'GraphQL' | 'CLI' | 'SDK';
  initialize(): Promise<void>;
  executeRequest(payload: any): Promise<any>;
  shutdown(): Promise<void>;
}
