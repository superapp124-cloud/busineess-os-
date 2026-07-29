import { BaseRepository } from '@/sdk/kernel/BaseRepository';

export interface ILegalContract {
  id: string;
  org_id: string;
  title: string;
  party_name: string;
  value?: number;
  status: 'Draft' | 'Review' | 'Approved' | 'Signed' | 'Rejected';
  ai_summary?: string;
  risk_score?: number;
  created_at: string;
}

export class LegalRepository extends BaseRepository<ILegalContract> {
  constructor() {
    super({
      capabilityId: 'legal-os',
      tableName: 'legal_contracts',
      objectName: 'Contract'
    });
  }

  // Capability specific methods
  async generateSummary(contractId: string): Promise<string> {
    // In a real application, this would invoke an Edge Function / AI model
    return "This is an AI-generated summary of the contract obligations and liabilities.";
  }
}

export const legalRepo = new LegalRepository();
