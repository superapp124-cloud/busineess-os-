import { StoredMutation } from './IndexedDBAdapter';

export interface ConflictResolutionResult {
  resolvedPayload: any;
  strategy: 'CLIENT_WINS' | 'SERVER_WINS' | 'MERGE';
  reconciledTimestamp: number;
}

export class ConflictResolver {
  public static resolve(localMutation: StoredMutation, serverState: any): ConflictResolutionResult {
    // Default Enterprise Strategy: Last-Write-Wins with optimistic local merge
    const localTimestamp = localMutation.timestamp;
    const serverTimestamp = serverState?.updated_at ? new Date(serverState.updated_at).getTime() : 0;

    if (localTimestamp >= serverTimestamp) {
      return {
        resolvedPayload: { ...serverState, ...localMutation.payload },
        strategy: 'CLIENT_WINS',
        reconciledTimestamp: Date.now()
      };
    } else {
      return {
        resolvedPayload: { ...localMutation.payload, ...serverState },
        strategy: 'SERVER_WINS',
        reconciledTimestamp: Date.now()
      };
    }
  }
}
