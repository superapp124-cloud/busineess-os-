import { WorkflowSDK } from '@/core/sdk/WorkflowSDK';

export const MockFlightProvider = WorkflowSDK.createProvider(
  'mock-flight-provider', 'Mock Flight Provider (Amadeus/MakeMyTrip abstraction)', 'travel', 'SearchProvider',
  {
    search: async (query: any) => {
      console.log(`[Flight] Searching flights:`, query);
      return [{ flightNumber: '6E-201', price: 8500, airline: 'IndiGo' }];
    },
    create: async (payload: any) => ({ id: `FL-${Date.now()}`, status: 'RESERVED' }),
    verify: async (id: string) => ({ id, status: 'CONFIRMED' })
  }
);

export const MockHotelProvider = WorkflowSDK.createProvider(
  'mock-hotel-provider', 'Mock Hotel Provider (Booking.com abstraction)', 'travel', 'SearchProvider',
  {
    search: async (query: any) => {
      console.log(`[Hotel] Searching hotels:`, query);
      return [{ hotelName: 'Taj Lands End', pricePerNight: 4500 }];
    },
    create: async (payload: any) => ({ id: `HT-${Date.now()}`, status: 'RESERVED' }),
    verify: async (id: string) => ({ id, status: 'CONFIRMED' })
  }
);

export const MockTaxiProvider = WorkflowSDK.createProvider(
  'mock-taxi-provider', 'Mock Taxi Provider (Ola/Uber Corporate abstraction)', 'travel', 'SearchProvider',
  {
    search: async (query: any) => {
      console.log(`[Taxi] Searching cabs:`, query);
      return [{ provider: 'Ola Corporate', estimatedPrice: 1200 }];
    },
    create: async (payload: any) => ({ id: `TX-${Date.now()}`, status: 'RESERVED' }),
    verify: async (id: string) => ({ id, status: 'CONFIRMED' })
  }
);
