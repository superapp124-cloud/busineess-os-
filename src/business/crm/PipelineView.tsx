import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Phone, Mail, IndianRupee, 
  ArrowRight, ArrowLeft, CheckCircle2, XCircle, RefreshCw 
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string;
  deal_value: number;
  probability: number;
  priority: string;
  tags: string[];
  created_at: string;
}

interface PipelineViewProps {
  businessId: string;
  onLeadUpdated: () => void;
}

const STAGES = [
  { key: 'new', label: 'New Leads', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
  { key: 'contacted', label: 'Contacted', color: 'border-purple-500/30 bg-purple-500/5 text-purple-400' },
  { key: 'qualified', label: 'Qualified', color: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400' },
  { key: 'proposal', label: 'Proposal Sent', color: 'border-amber-500/30 bg-amber-500/5 text-amber-400' },
  { key: 'won', label: 'Won / Closed', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' },
  { key: 'lost', label: 'Lost', color: 'border-red-500/30 bg-red-500/5 text-red-400' },
];

export function PipelineView({ businessId, onLeadUpdated }: PipelineViewProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads((data as any) || []);
    } catch (err: any) {
      console.error('Error loading pipeline leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [businessId]);

  const handleMoveStage = async (leadId: string, newStage: string) => {
    setUpdatingId(leadId);
    try {
      const { error } = await supabase
        .from('crm_leads')
        .update({ status: newStage })
        .eq('id', leadId);

      if (error) throw error;
      
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStage } : l));
      toast({ title: 'Stage Updated', description: `Lead moved to ${newStage}` });
      onLeadUpdated();
    } catch (err: any) {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Kanban pipeline...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter(l => (l.status || 'new').toLowerCase() === stage.key);
        const stageValue = stageLeads.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0);

        return (
          <div key={stage.key} className="flex flex-col rounded-2xl bg-[#111224] border border-white/10 p-3 min-w-[240px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">{stage.label}</h4>
                <p className="text-[11px] text-slate-400 font-medium">₹{stageValue.toLocaleString('en-IN')}</p>
              </div>
              <Badge variant="outline" className={stage.color}>
                {stageLeads.length}
              </Badge>
            </div>

            {/* Column Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {stageLeads.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-white/5 rounded-xl">
                  No leads in {stage.label}
                </div>
              ) : (
                stageLeads.map((lead) => (
                  <Card key={lead.id} className="p-3.5 bg-[#171932] border-white/10 hover:border-purple-500/40 transition-all rounded-xl space-y-2.5 shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-white leading-tight line-clamp-1">{lead.name}</h5>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        ₹{(lead.deal_value || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {lead.company && (
                      <p className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{lead.company}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      {lead.phone && (
                        <span className="flex items-center gap-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{lead.phone}</span>
                        </span>
                      )}
                    </div>

                    {/* Stage transition buttons */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                      {stage.key !== 'new' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updatingId === lead.id}
                          onClick={() => {
                            const prevIndex = STAGES.findIndex(s => s.key === stage.key) - 1;
                            if (prevIndex >= 0) handleMoveStage(lead.id, STAGES[prevIndex].key);
                          }}
                          className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-white"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </Button>
                      )}
                      
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Move</span>

                      {stage.key !== 'won' && stage.key !== 'lost' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updatingId === lead.id}
                          onClick={() => {
                            const nextIndex = STAGES.findIndex(s => s.key === stage.key) + 1;
                            if (nextIndex < STAGES.length) handleMoveStage(lead.id, STAGES[nextIndex].key);
                          }}
                          className="h-6 px-1.5 text-[10px] text-purple-400 hover:text-purple-300"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}

                      {stage.key === 'proposal' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updatingId === lead.id}
                          onClick={() => handleMoveStage(lead.id, 'won')}
                          className="h-6 px-1.5 text-[10px] text-emerald-400 hover:text-emerald-300"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

