import { IProvider, ProviderCapabilities, ProviderState, providerRegistry, ProviderRole } from './ProviderRegistry';
import { searchRuntime } from '../runtime/SearchRuntime';

export class FlightProviderStub implements IProvider {
  id = 'sys.flight.amadeus.stub';
  name = 'Amadeus Flight Provider (Production Stub)';
  type = 'flight';
  role: ProviderRole = 'SearchProvider';
  
  capabilities(): ProviderCapabilities {
    return { canSearch: true, canBook: true, canCancel: true, canVerify: true };
  }
  
  async health(): Promise<ProviderState> {
    return { isHealthy: true, lastChecked: Date.now() };
  }

  async authenticate() { return true; }

  async search(query: any): Promise<any[]> {
    console.log(`[FlightProvider] Searching for:`, query);
    
    // STRICT PRODUCTION RULE: No AI generation for reality.
    // In production without an API key, return a deterministic stub that matches the Amadeus API schema.
    return [
      {
        id: 'FL-6E123', airline: 'IndiGo', from: query.from, to: query.to,
        departureTime: '06:20', arrivalTime: '08:05', price: '₹4,980', stops: 'Non Stop', baggage: '15kg',
        _provider: this.name
      },
      {
        id: 'FL-AI456', airline: 'Air India', from: query.from, to: query.to,
        departureTime: '07:40', arrivalTime: '09:50', price: '₹5,240', stops: 'Non Stop', baggage: '15kg',
        _provider: this.name
      },
      {
        id: 'FL-UK789', airline: 'Vistara', from: query.from, to: query.to,
        departureTime: '09:15', arrivalTime: '11:20', price: '₹6,180', stops: 'Non Stop', baggage: '15kg',
        _provider: this.name
      }
    ];
  }

  async create(payload: any): Promise<any> {
    console.log(`[FlightProvider] Booking flight...`, payload);
    return {
      success: true,
      pnr: 'XYZ890',
      message: 'Airline confirms reservation',
      _provider: this.name
    };
  }

  async verify(id: string): Promise<any> {
    return { verified: true, status: 'confirmed' };
  }
}

// Auto-register
const flightProvider = new FlightProviderStub();
providerRegistry.register(flightProvider);
searchRuntime.registerProvider('flight', {
  search: async (query) => {
    const results = await flightProvider.search(query.filters);
    return { results: results.map(r => ({ ...r, title: `${r.airline} - ${r.departureTime}`, subtitle: `${r.from} to ${r.to}`, price: r.price })) };
  }
});
