// EvidenceEngine.ts
import { ProviderMetadata, TrustLevel } from './ProviderRegistry';
import { globalMissionBus } from './MissionBus';

export interface EvidenceItem {
  id: string;
  providerId: string;
  sourceName: string;
  sourceType: string;
  domain: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  verifiedAt: string;
  evidence: string;
  whyUsed: string;
  trustLevel: TrustLevel;
  freshness: string;
}

export class EvidenceEngine {
  private evidence: Map<string, EvidenceItem> = new Map();

  // In Phase 2, this will be driven by real backend streams over WebSockets.
  addEvidence(item: EvidenceItem) {
    this.evidence.set(item.id, item);
    globalMissionBus.publish('evidence.added', item);
  }

  startLiveGathering(query: string) {
    this.evidence.clear();
    const eventSource = new EventSource(`http://localhost:8787/api/v1/os/grocery?q=${encodeURIComponent(query)}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'STATE_CHANGE') {
        globalMissionBus.publish('mission.state', data);
      } else if (data.type === 'PROVIDER_START') {
         // Create pending evidence card
         this.addEvidence({
            id: `ev_${Date.now()}_${Math.random()}`,
            providerId: data.provider,
            sourceName: data.provider,
            sourceType: 'Retailer',
            domain: `${data.provider.toLowerCase()}.com`,
            status: 'Pending',
            verifiedAt: 'Gathering...',
            evidence: 'Waiting for live price check...',
            whyUsed: 'Top Grocery Provider',
            trustLevel: 'High',
            freshness: 'Live'
         });
      } else if (data.type === 'PROVIDER_EVIDENCE') {
         // Update card with real price
         const item: EvidenceItem = {
            id: `ev_${Date.now()}_${Math.random()}`,
            providerId: data.provider,
            sourceName: data.provider,
            sourceType: 'Retailer',
            domain: `${data.provider.toLowerCase()}.com`,
            status: 'Verified',
            verifiedAt: 'Just now',
            evidence: data.evidence.totalCost > 0 ? `Cost: ₹${data.evidence.totalCost} (${data.evidence.itemsAvailable.length} items)` : 'Out of stock / Unavailable',
            whyUsed: 'Live Playwright Scrape',
            trustLevel: 'High',
            freshness: 'Live'
         };
         this.addEvidence(item);
      } else if (data.type === 'OPTIMIZATION_COMPLETE') {
         globalMissionBus.publish('mission.optimization', data.result);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };
  }

  getEvidenceForMission(missionId: string): EvidenceItem[] {
    return Array.from(this.evidence.values());
  }

  getAll(): EvidenceItem[] {
    return Array.from(this.evidence.values());
  }
}

export const globalEvidenceEngine = new EvidenceEngine();
