import { BaseRepository } from '@/sdk/kernel/BaseRepository';
import { supabase } from '@/integrations/supabase/client';

export interface IGrowthCampaign {
  id: string;
  org_id: string;
  name: string;
  objective: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  roi_predicted?: number;
  budget?: number;
  created_at: string;
}

export class GrowthRepository extends BaseRepository<IGrowthCampaign> {
  constructor() {
    super({
      capabilityId: 'growth-os',
      tableName: 'growth_campaigns',
      objectName: 'Campaign'
    });
  }

  // Custom methods specific to GrowthOS
  async getExecutiveBriefing(orgId: string): Promise<any> {
    // In a real app, this would aggregate data from growth_campaigns, crm_sales, etc.
    return {
      revenueTrend: '+14%',
      pipelineHealth: 'Strong',
      activeCampaigns: 3,
      recommendedActions: [
        { id: '1', text: 'Pause LinkedIn Campaign B (Low ROI)' },
        { id: '2', text: 'Approve new Brand Assets for Q4' }
      ]
    };
  }
}

export const growthRepo = new GrowthRepository();
