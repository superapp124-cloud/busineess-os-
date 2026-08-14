export type CapabilityType = 
  | 'TextGeneration' 
  | 'ImageGeneration' 
  | 'Search' 
  | 'CRM_Action' 
  | 'Calendar_Action' 
  | 'Email_Action';

export interface ProviderCapability {
  providerId: string;
  capabilityType: CapabilityType;
  execute: (payload: any, context: any) => Promise<any>;
}

class CapabilityRegistryService {
  private providers: Map<CapabilityType, ProviderCapability[]> = new Map();

  constructor() {
    // Register default core capability execution providers
    this.register({
      providerId: 'default',
      capabilityType: 'Calendar_Action',
      execute: async (payload: any, context: any) => ({
        status: 'SUCCESS',
        calendarEventId: `cal_evt_${Date.now()}`,
        timeSlot: payload.timeSlot || '2026-08-15T10:00:00Z',
        candidateId: payload.candidateId || 'candidate_847'
      })
    });

    this.register({
      providerId: 'default',
      capabilityType: 'CRM_Action',
      execute: async (payload: any, context: any) => ({
        status: 'SUCCESS',
        crmRecordId: `crm_rec_${Date.now()}`,
        updatedFields: payload
      })
    });

    this.register({
      providerId: 'default',
      capabilityType: 'Email_Action',
      execute: async (payload: any, context: any) => ({
        status: 'SUCCESS',
        messageId: `msg_eml_${Date.now()}`
      })
    });
  }

  register(capability: ProviderCapability) {
    if (!this.providers.has(capability.capabilityType)) {
      this.providers.set(capability.capabilityType, []);
    }
    this.providers.get(capability.capabilityType)?.push(capability);
    console.log(`Registered provider ${capability.providerId} for ${capability.capabilityType}`);
  }

  getProviders(type: CapabilityType): ProviderCapability[] {
    return this.providers.get(type) || [];
  }

  getProvider(type: CapabilityType, providerId: string): ProviderCapability | undefined {
    const caps = this.providers.get(type) || [];
    return caps.find(c => c.providerId === providerId) || caps[0];
  }
}

export const CapabilityRegistry = new CapabilityRegistryService();
