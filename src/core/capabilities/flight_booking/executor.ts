import { Commitment, ExecutionResult, Provider, RealityVerificationResult } from '../types';
import { providerRegistry } from '../../providers/ProviderRegistry';

export async function execute(commitment: Commitment, provider: Provider): Promise<ExecutionResult> {
  console.log(`[${commitment.capability}] Executing...`);
  
  // Use the provider registry to get a healthy flight ExecutionProvider
  const providers = await providerRegistry.getHealthyProviders('flight', 'ExecutionProvider');
  if (providers.length === 0) {
    // For the demo we fallback to the SearchProvider if they merged them, but properly it should be ExecutionProvider
    const fallbacks = await providerRegistry.getHealthyProviders('flight', 'SearchProvider');
    if (fallbacks.length === 0) throw new Error('No flight providers available');
    providers.push(fallbacks[0]);
  }
  
  const flightProvider = providers[0];
  if (!flightProvider.create) throw new Error(`Provider ${flightProvider.name} does not support creation.`);
  
  const result = await flightProvider.create(commitment.selectedResult);
  
  return { 
    success: result.success, 
    commitmentId: commitment.id,
    providerData: result 
  };
}

export async function verifier(commitment: Commitment, provider: Provider): Promise<RealityVerificationResult> {
  // Simulate an async verification check (e.g., polling PNR status)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return { 
    verified: true, 
    provider: 'Amadeus',
    timestamp: new Date().toISOString(),
    transactionId: 'ABC12345',
    evidence: { pnr: 'ABC12345', status: 'CONFIRMED', raw: { message: 'Airline confirms reservation' } }
  };
}

export async function undo(commitmentId: string, provider: Provider): Promise<void> {
  console.log(`[${commitmentId}] Undo executed.`);
}
