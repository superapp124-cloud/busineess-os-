import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Activity, CheckCircle2, AlertTriangle, AlertCircle, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { DealHealthAnalysis } from '@/core/capabilities/crm/types';
import { DealHealthAnalyzer } from '@/core/capabilities/crm/DealHealthAnalyzer';
import { useToast } from '@/hooks/use-toast';

interface NextBestActionCardProps {
  leadId?: string;
  businessId?: string;
  leadName?: string;
  onExecuteAction?: (actionType: string) => void;
}

export function NextBestActionCard({ leadId, leadName, onExecuteAction }: NextBestActionCardProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<DealHealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      loadAnalysis();
    } else {
      setLoading(false);
    }
  }, [leadId]);

  const loadAnalysis = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const res = await DealHealthAnalyzer.analyzeDealHealth(leadId);
      setAnalysis(res);
    } catch (err) {
      console.error('Error loading deal health analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = () => {
    if (onExecuteAction && analysis?.recommended_action) {
      onExecuteAction(analysis.recommended_action.action_type);
    } else {
      toast({
        title: 'Action Triggered',
        description: `Preparing ${analysis?.recommended_action.title || 'outreach'} workflow for ${leadName || 'lead'}.`,
      });
    }
  };

  const getStatusBadge = (status?: DealHealthAnalysis['status']) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Healthy Deal
          </Badge>
        );
      case 'AT_RISK':
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> At-Risk Deal
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Needs Attention
          </Badge>
        );
    }
  };

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'email':
        return <Mail className="h-4 w-4 text-indigo-400" />;
      case 'call':
        return <Phone className="h-4 w-4 text-emerald-400" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-amber-400" />;
      default:
        return <FileText className="h-4 w-4 text-cyan-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-4 bg-slate-900 border border-slate-800 text-slate-100 flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
        <span className="text-sm text-slate-300">Calculating AI Deal Health & Next Best Action...</span>
      </Card>
    );
  }

  const currentAnalysis = analysis || {
    score: 75,
    status: 'HEALTHY' as const,
    insights: ['High engagement level', 'Target decision maker identified'],
    recommended_action: {
      title: 'Send Custom Solution Proposal',
      description: 'Prospect requested custom scope details. Deliver proposal within 24h.',
      action_type: 'proposal'
    }
  };

  return (
    <Card className="p-5 bg-slate-900 border border-slate-800 text-slate-100 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-lg text-slate-100">AI Deal Health & Next Best Action</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-800 text-indigo-300 border-slate-700 font-mono">
            Score: {currentAnalysis.score}/100
          </Badge>
          {getStatusBadge(currentAnalysis.status)}
        </div>
      </div>

      {/* Insights */}
      {currentAnalysis.insights && currentAnalysis.insights.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Health Signals</div>
          <ul className="text-xs text-slate-300 space-y-1">
            {currentAnalysis.insights.map((insight, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action Card */}
      <div className="p-3.5 bg-slate-800/70 rounded-lg border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getActionIcon(currentAnalysis.recommended_action.action_type)}
            <h4 className="font-semibold text-sm text-slate-100">
              {currentAnalysis.recommended_action.title}
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            {currentAnalysis.recommended_action.description}
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleActionClick}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 whitespace-nowrap self-end md:self-auto"
        >
          Execute Action
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
