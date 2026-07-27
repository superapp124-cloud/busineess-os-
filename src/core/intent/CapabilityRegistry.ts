// CapabilityRegistry.ts

export type CapabilityCategory = 
  | 'Research'
  | 'Decision'
  | 'Finance'
  | 'Automation'
  | 'Monitoring'
  | 'AI';

export interface Capability {
  id: string;
  category: CapabilityCategory;
  label: string;
  icon: string;
  description: string;
}

export class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  register(capability: Capability) {
    this.capabilities.set(capability.id, capability);
  }

  getCapabilitiesForMission(missionType: string): Capability[] {
    // In a real system, the Mission Planner queries the Capability Graph
    // to find what's applicable. For now, we return all registered.
    return Array.from(this.capabilities.values());
  }

  getAll(): Capability[] {
    return Array.from(this.capabilities.values());
  }
}

export const globalCapabilityRegistry = new CapabilityRegistry();

// Register the universal capabilities defined in the OS architecture
const defaultCapabilities: Capability[] = [
  // Research
  { id: 'cap_research_explain', category: 'Research', label: 'Explain', icon: 'Info', description: 'Understand why this is best' },
  { id: 'cap_research_compare', category: 'Research', label: 'Compare Alternatives', icon: 'List', description: 'Compare across top options' },
  { id: 'cap_research_specs', category: 'Research', label: 'Compare Specs', icon: 'Smartphone', description: 'Compare full specifications' },
  
  // Decision
  { id: 'cap_decision_open_best', category: 'Decision', label: 'Open Best Option', icon: 'ArrowRight', description: 'Open the top recommended option' },
  
  // Finance
  { id: 'cap_finance_save', category: 'Finance', label: 'Save Money', icon: 'DollarSign', description: 'Find best coupons & offers' },
  { id: 'cap_finance_bank', category: 'Finance', label: 'Check Bank Offers', icon: 'CreditCard', description: 'View card discounts & cashback' },
  { id: 'cap_finance_emi', category: 'Finance', label: 'Calculate EMI', icon: 'Calculator', description: 'EMI plans & monthly breakdown' },
  
  // Monitoring
  { id: 'cap_monitor_price_history', category: 'Monitoring', label: 'Price History', icon: 'TrendingDown', description: 'See price trend over time' },
  { id: 'cap_monitor_alerts', category: 'Monitoring', label: 'Price Alerts', icon: 'Bell', description: 'Get notified on price drops' },
];

defaultCapabilities.forEach(cap => globalCapabilityRegistry.register(cap));
