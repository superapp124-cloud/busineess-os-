import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Sparkles, UserPlus, Briefcase, FileText, ArrowRight, MessageSquare, Loader2, PhoneCall, Radio, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  markRecruitmentCallInterviewScheduled,
  simulatePositiveRecruitmentResponse,
} from '@/services/orchestrationService';

interface Requisition {
  id: string;
  title: string;
  location: string;
  type: string;
  status: string;
}

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  applied_for: string | null;
}

interface AutomationEvent {
  id: string;
  event_type: string;
  candidate_id: string | null;
  payload: any;
  created_at: string;
}

interface MobileAction {
  id: string;
  action_type: string;
  candidate_id: string | null;
  payload: any;
  status: string;
  created_at: string;
}

export const RecruiterWorkspace: React.FC = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [automationEvents, setAutomationEvents] = useState<AutomationEvent[]>([]);
  const [mobileActions, setMobileActions] = useState<MobileAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [automationBusy, setAutomationBusy] = useState<string | null>(null);
  
  const [showNewReq, setShowNewReq] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [newReqLocation, setNewReqLocation] = useState('');

  useEffect(() => {
    fetchData();
    fetchAutomationData();

    // Subscribe to realtime changes
    const reqChannel = supabase
      .channel('schema-db-changes-reqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requisitions' }, (payload) => {
        fetchData();
      })
      .subscribe();

    const candChannel = supabase
      .channel('schema-db-changes-cands')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, (payload) => {
        fetchData();
      })
      .subscribe();

    const eventChannel = supabase
      .channel('schema-db-changes-orchestration-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'communication_events' }, () => {
        fetchAutomationData();
      })
      .subscribe();

    const actionChannel = supabase
      .channel('schema-db-changes-mobile-actions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mobile_action_queue' }, () => {
        fetchAutomationData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(reqChannel);
      supabase.removeChannel(candChannel);
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(actionChannel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [reqsRes, candsRes] = await Promise.all([
        supabase.from('requisitions').select('*').order('created_at', { ascending: false }),
        supabase.from('candidates').select('*').order('created_at', { ascending: false })
      ]);
      
      if (reqsRes.data) setRequisitions(reqsRes.data);
      if (candsRes.data) setCandidates(candsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAutomationData = async () => {
    try {
      const [eventsRes, actionsRes] = await Promise.all([
        supabase
          .from('communication_events')
          .select('id,event_type,candidate_id,payload,created_at')
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('mobile_action_queue')
          .select('id,action_type,candidate_id,payload,status,created_at')
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      if (eventsRes.data) setAutomationEvents(eventsRes.data as AutomationEvent[]);
      if (actionsRes.data) setMobileActions(actionsRes.data as MobileAction[]);
    } catch (e) {
      console.error('[RecruiterWorkspace] Failed to fetch automation data:', e);
    }
  };

  const createRequisition = async () => {
    if (!newReqTitle || !newReqLocation) return;
    
    await supabase.from('requisitions').insert({
      title: newReqTitle,
      department: 'Engineering', // Default for now
      location: newReqLocation,
      type: 'Full-time',
      status: 'Open'
    });
    
    setNewReqTitle('');
    setNewReqLocation('');
    setShowNewReq(false);
  };

  const triggerPositiveResponse = async (candidate: Candidate) => {
    setAutomationBusy(`positive-${candidate.id}`);
    try {
      const result = await simulatePositiveRecruitmentResponse(candidate);
      toast.success('Positive response routed', {
        description: result?.queuedActions?.length
          ? 'Call action queued for mobile.'
          : 'Event captured. No mobile action was needed.',
      });
      await Promise.all([fetchData(), fetchAutomationData()]);
    } catch (err: any) {
      console.error('[RecruiterWorkspace] Positive response failed:', err);
      toast.error('Could not route positive response', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setAutomationBusy(null);
    }
  };

  const triggerInterviewScheduled = async (candidate: Candidate) => {
    setAutomationBusy(`scheduled-${candidate.id}`);
    try {
      await markRecruitmentCallInterviewScheduled(candidate);
      toast.success('Interview scheduled', {
        description: 'Workspace updated and confirmation message queued.',
      });
      await Promise.all([fetchData(), fetchAutomationData()]);
    } catch (err: any) {
      console.error('[RecruiterWorkspace] Interview scheduled flow failed:', err);
      toast.error('Could not complete call outcome flow', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setAutomationBusy(null);
    }
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Interview Scheduled':
        return 'bg-emerald-100 text-emerald-700';
      case 'Call Queued':
        return 'bg-blue-100 text-blue-700';
      case 'Interviewing':
        return 'bg-purple-100 text-purple-700';
      case 'Offered':
        return 'bg-indigo-100 text-indigo-700';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const formatEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'message.received':
        return 'Message received';
      case 'intent.classified':
        return 'Intent classified';
      case 'workflow.action_queued':
        return 'Action queued';
      case 'call.ended':
        return 'Call ended';
      case 'workspace.updated':
        return 'Workspace updated';
      case 'message.send_queued':
        return 'Message queued';
      default:
        return eventType;
    }
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden w-full">
      
      {/* Main Dashboard Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">RecruitmentOS</h1>
            <p className="text-sm text-slate-500 mt-1">Your AI-powered hiring command center.</p>
          </div>
          <Button onClick={() => setShowNewReq(true)} className="bg-[#5c22ff] hover:bg-[#4b1ac4] shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" /> New Requisition
          </Button>
        </div>

        {/* New Requisition Inline Form */}
        {showNewReq && (
          <Card className="p-4 mb-8 bg-white border shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Create New Role</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Job Title</label>
                <Input value={newReqTitle} onChange={e => setNewReqTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Location</label>
                <Input value={newReqLocation} onChange={e => setNewReqLocation(e.target.value)} placeholder="e.g. Remote, India" />
              </div>
              <Button onClick={createRequisition} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Role</Button>
              <Button variant="ghost" onClick={() => setShowNewReq(false)}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-none shadow-sm flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{requisitions.length}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Roles</p>
            </div>
          </Card>
          <Card className="p-4 border-none shadow-sm flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{candidates.length}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Candidates</p>
            </div>
          </Card>
          <Card className="p-4 border-none shadow-sm flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {candidates.filter(c => c.status === 'Interviewing' || c.status === 'Interview Scheduled').length}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Interviews</p>
            </div>
          </Card>
          <Card className="p-4 border-none shadow-sm flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {candidates.filter(c => c.status === 'Offered').length}
              </p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Offers Pending</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Active Requisitions */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Active Roles</h2>
              <Button variant="ghost" size="sm" className="text-[#5c22ff]">View All</Button>
            </div>
            
            <Card className="border-none shadow-sm overflow-hidden bg-white min-h-[150px]">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : requisitions.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-slate-500">
                  No active roles. Click 'New Requisition' to add one.
                </div>
              ) : (
                requisitions.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-slate-50">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-slate-800">{req.title}</h3>
                      <span className="text-xs text-slate-500">{req.location} • {req.type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                          {candidates.filter(c => c.applied_for === req.id).length}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase">Sourced</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                ))
              )}
            </Card>

            <div className="flex items-center justify-between mt-8">
              <h2 className="text-lg font-semibold text-slate-800">Recent Candidates</h2>
            </div>
            <Card className="border-none shadow-sm bg-white p-2 min-h-[150px]">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : candidates.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-slate-500">
                  No candidates yet.
                </div>
              ) : (
                candidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {candidate.first_name[0]}{candidate.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm text-slate-800">{candidate.first_name} {candidate.last_name}</h4>
                        <p className="text-xs text-slate-500">
                          Applied for: {requisitions.find(r => r.id === candidate.applied_for)?.title || 'General'}
                        </p>
                        <p className="text-[11px] text-slate-400">{candidate.phone || candidate.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-blue-200 text-blue-700"
                        disabled={automationBusy === `positive-${candidate.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          triggerPositiveResponse(candidate);
                        }}
                      >
                        {automationBusy === `positive-${candidate.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Radio className="w-3 h-3 mr-1" />
                        )}
                        Positive reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-emerald-200 text-emerald-700"
                        disabled={automationBusy === `scheduled-${candidate.id}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          triggerInterviewScheduled(candidate);
                        }}
                      >
                        {automationBusy === `scheduled-${candidate.id}` ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <PhoneCall className="w-3 h-3 mr-1" />
                        )}
                        Interview scheduled
                      </Button>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusClasses(candidate.status)}`}>
                        {candidate.status}
                      </span>
                      <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* AI Intelligence Sidebar */}
          <div className="col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Live Automation</h2>
            </div>

            <Card className="border-none shadow-sm bg-white p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Queue</p>
                    <span className="text-[11px] text-slate-400">{mobileActions.filter(a => a.status === 'pending').length} pending</span>
                  </div>
                  <div className="space-y-2">
                    {mobileActions.slice(0, 3).map(action => (
                      <div key={action.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          {action.action_type === 'place_call' ? <PhoneCall className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 capitalize">{action.action_type.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-500 truncate">{action.payload?.candidateName || action.payload?.phone || 'Candidate action'}</p>
                          <p className="text-[11px] text-blue-600 font-semibold capitalize">{action.status}</p>
                        </div>
                      </div>
                    ))}
                    {mobileActions.length === 0 && (
                      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">No queued mobile actions yet.</div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Event Bus</p>
                  <div className="space-y-2">
                    {automationEvents.slice(0, 4).map(event => (
                      <div key={event.id} className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800">{formatEventLabel(event.event_type)}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {automationEvents.length === 0 && (
                      <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">No orchestration events yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5c22ff]" />
              <h2 className="text-lg font-semibold text-slate-800">AI Suggestions</h2>
            </div>
            
            <Card className="border-none shadow-sm bg-gradient-to-br from-[#5c22ff]/5 to-transparent p-4">
              <div className="space-y-4">
                
                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Follow up with Rahul</p>
                      <p className="text-xs text-slate-500 mt-0.5">Rahul completed his technical assessment with a score of 92%. Should we invite him to the final round?</p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="bg-[#5c22ff] hover:bg-[#4b1ac4] h-7 text-xs text-white">Send Invite</Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs">View Scorecard</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Schedule interview for Priya</p>
                      <p className="text-xs text-slate-500 mt-0.5">Priya accepted your calendar invite. Let's send the prep materials.</p>
                      <Button size="sm" variant="outline" className="mt-2 h-7 text-xs border-[#5c22ff] text-[#5c22ff]">Review Prep Kit <ArrowRight className="w-3 h-3 ml-1"/></Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Prepare offer for Ankit</p>
                      <p className="text-xs text-slate-500 mt-0.5">Hiring manager approved Ankit for the Sr. Backend role. Draft the offer?</p>
                      <Button size="sm" variant="outline" className="mt-2 h-7 text-xs border-[#5c22ff] text-[#5c22ff]">Draft Offer <ArrowRight className="w-3 h-3 ml-1"/></Button>
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* Business Value Metrics */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">AI Value Delivered (This Month)</h3>
              <div className="space-y-3 bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-xs font-medium text-slate-600">Recruiter Hours Saved</span>
                  <span className="text-sm font-bold text-emerald-600">42 hrs</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-xs font-medium text-slate-600">Avg Time-to-Hire</span>
                  <span className="text-sm font-bold text-emerald-600">14 days <span className="text-[10px] text-slate-400 font-normal">(-3d)</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-600">Candidate Response Rate</span>
                  <span className="text-sm font-bold text-emerald-600">86% <span className="text-[10px] text-slate-400 font-normal">(+12%)</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
