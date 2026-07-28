import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SalesLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  status: string; // New, Contacted, Qualified, Unqualified
  source: string | null;
  ai_score: number | null;
  created_at: string;
}

export interface SalesDeal {
  id: string;
  lead_id: string | null;
  name: string;
  amount: number;
  stage: string; // Discovery, Proposal, Negotiation, Won, Lost
  probability: number;
  expected_close_date: string | null;
  created_at: string;
}

export function useSalesOS() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [deals, setDeals] = useState<SalesDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, dealsRes] = await Promise.all([
        supabase.from('sales_leads').select('*').order('created_at', { ascending: false }),
        supabase.from('sales_deals').select('*').order('created_at', { ascending: false })
      ]);
      
      if (leadsRes.data) setLeads(leadsRes.data);
      if (dealsRes.data) setDeals(dealsRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const leadsSub = supabase.channel('sales-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_leads' }, fetchData)
      .subscribe();

    const dealsSub = supabase.channel('sales-deals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_deals' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(leadsSub);
      supabase.removeChannel(dealsSub);
    };
  }, [fetchData]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    await supabase.from('sales_leads').update({ status }).eq('id', leadId);
  };

  const updateDealStage = async (dealId: string, stage: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage } : d));
    await supabase.from('sales_deals').update({ stage }).eq('id', dealId);
  };

  return { leads, deals, loading, updateLeadStatus, updateDealStage };
}
