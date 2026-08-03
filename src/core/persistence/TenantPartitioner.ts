import { EnterpriseEvent } from '../../types';

export class TenantPartitioner {
  private static readonly CLUSTER_SIZE = 4; // Mock 4 partitions

  /**
   * Deterministically assigns an event to a partition based on its Tenant ID.
   * This mimics Kafka partition keys to ensure strict ordering per tenant.
   */
  public static resolvePartition(tenantId: string): number {
    if (!tenantId) return 0;
    
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      const char = tenantId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash) % this.CLUSTER_SIZE;
  }

  public static getPartitionTopic(event: EnterpriseEvent): string {
    const partition = this.resolvePartition(event.tenantId);
    return `enterprise.events.partition.${partition}`;
  }
}
