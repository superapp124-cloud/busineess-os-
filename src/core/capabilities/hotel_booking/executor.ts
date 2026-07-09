import { Commitment, ExecutionResult, Provider, RealityVerificationResult } from '../types';

export async function execute(commitment: Commitment, provider: Provider): Promise<ExecutionResult> {
  console.log(`[${commitment.capability}] Executing...`);
  
  await provider.executeAction('execute', { id: commitment.id });
  return { success: true, commitmentId: commitment.id };
}

export async function verifier(commitment: Commitment, provider: Provider): Promise<RealityVerificationResult> {
  return { verified: true, message: 'Reality verified (mock).' };
}

export async function undo(commitmentId: string, provider: Provider): Promise<void> {
  console.log(`[${commitmentId}] Undo executed.`);
}
