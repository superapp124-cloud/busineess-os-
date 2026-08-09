import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Globe, ExternalLink, ShieldCheck, Building2, Users, DollarSign, Cpu, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { LeadDossier, EvidenceItem } from '@/core/capabilities/crm/types';
import { LeadEnrichmentWorker } from '@/core/capabilities/crm/LeadEnrichmentWorker';

interface LeadDossierCardProps {
  businessId: string;
  leadId: string;
  companyName?: string;
}

export function LeadDossierCard({ businessId, leadId, companyName }: LeadDossierCardProps) {
  const [dossier, setDossier] = useState<LeadDossier | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    loadDossier();
  }, [leadId]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      const { data: dossierData } = await supabase
        .from('crm_lead_dossiers')
        .select('*')
        .eq('lead_id', leadId)
        .maybeSingle();

      if (dossierData) {
        setDossier(dossierData as LeadDossier);

        const { data: evidenceData } = await supabase
          .from('crm_evidence_ledger')
          .select('*')
          .eq('lead_id', leadId)
          .order('retrieved_at', { ascending: false });

        setEvidence((evidenceData || []) as EvidenceItem[]);
      } else {
        // Auto-run enrichment if no dossier exists yet
        await handleEnrich();
      }
    } catch (err) {
      console.error('Error loading lead dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrich = async () => {
    setEnriching(true);
    try {
      const result = await LeadEnrichmentWorker.enrichLead(businessId, leadId);
      if (result.dossier) {
        setDossier(result.dossier);
        setEvidence(result.evidence);
      }
    } catch (err) {
      console.error('Error enriching lead:', err);
    } finally {
      setEnriching(false);
    }
  };

  if (loading || enriching) {
    return (
      <Card className="p-5 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 text-slate-100 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
            <div>
              <h4 className="font-semibold text-indigo-200">AI Agent Researching Dossier...</h4>
              <p className="text-xs text-slate-400">Scraping web data & compiling evidence-backed dossier</p>
            </div>
          </div>
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            Scanning Web
          </Badge>
        </div>
      </Card>
    );
  }

  if (!dossier) {
    return (
      <Card className="p-4 bg-slate-900 border-slate-800 text-slate-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">No AI dossier compiled yet for {companyName || 'this lead'}.</p>
          <Button size="sm" onClick={handleEnrich} className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white">
            <Sparkles className="h-4 w-4" />
            Generate Dossier
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 text-slate-100 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-lg text-slate-100">AI Account Dossier</h3>
          <Badge variant="outline" className="ml-2 border-indigo-500/40 text-indigo-300 bg-indigo-500/10 text-xs">
            Zero-Guessing Evidence Logged
          </Badge>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEnrich}
          disabled={enriching}
          className="text-slate-400 hover:text-slate-200 h-8 px-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${enriching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Executive Summary */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Executive Brief</h4>
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-800">
          {dossier.executive_summary}
        </p>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-800/40 p-2.5 rounded-md border border-slate-800/80">
          <div className="text-slate-400 flex items-center gap-1 mb-1">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" /> Industry
          </div>
          <div className="font-medium text-slate-200 truncate">{dossier.industry}</div>
        </div>

        <div className="bg-slate-800/40 p-2.5 rounded-md border border-slate-800/80">
          <div className="text-slate-400 flex items-center gap-1 mb-1">
            <Users className="h-3.5 w-3.5 text-emerald-400" /> Est. Team Size
          </div>
          <div className="font-medium text-slate-200">{dossier.company_size}</div>
        </div>

        <div className="bg-slate-800/40 p-2.5 rounded-md border border-slate-800/80">
          <div className="text-slate-400 flex items-center gap-1 mb-1">
            <DollarSign className="h-3.5 w-3.5 text-amber-400" /> Est. Revenue
          </div>
          <div className="font-medium text-slate-200">{dossier.estimated_revenue}</div>
        </div>

        <div className="bg-slate-800/40 p-2.5 rounded-md border border-slate-800/80">
          <div className="text-slate-400 flex items-center gap-1 mb-1">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" /> Key Stack
          </div>
          <div className="font-medium text-slate-200 truncate">
            {dossier.tech_stack?.slice(0, 2).join(', ') || 'Modern Web'}
          </div>
        </div>
      </div>

      {/* Tech Stack Badges */}
      {dossier.tech_stack && dossier.tech_stack.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Detected Tech & Tools</h4>
          <div className="flex flex-wrap gap-1.5">
            {dossier.tech_stack.map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700 text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Ledger Drawer Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEvidence(!showEvidence)}
          className="w-full flex items-center justify-between text-xs text-indigo-300 hover:text-indigo-200 hover:bg-slate-800/60"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Evidence Ledger ({evidence.length} Cited Sources)
          </span>
          {showEvidence ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showEvidence && (
          <div className="mt-2 space-y-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
            {evidence.length === 0 ? (
              <p className="text-slate-400">No explicit evidence citations recorded yet.</p>
            ) : (
              evidence.map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-300 uppercase text-[10px]">{item.field_name}</span>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                    >
                      <Globe className="h-3 w-3" />
                      Source Link
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-300 italic">"{item.quoted_snippet}"</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
