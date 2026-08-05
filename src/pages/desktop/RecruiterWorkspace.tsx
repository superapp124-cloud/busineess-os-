/**
 * CHATR AI Talent Operating System (TOS) v3.0
 * Enterprise ATS — /desktop/recruitment
 * 
 * Capability Shell Architecture:
 * Decomposed into 11 capability-driven modules under
 * src/pages/desktop/components/recruiter-workspace/
 */

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  markRecruitmentCallInterviewScheduled,
  simulatePositiveRecruitmentResponse,
} from '@/services/orchestrationService';

import {
  TosTab, Candidate, Requisition, AutomationEvent, MobileAction, CandidateStage,
  publishTOSEvent, enrichCandidateData,
  TabBar, CommandPalette,
  ImportJobModal, ImportCVModal, CandidateProfileModal,
  FloatingAIAssistant,
  DashboardTab, PipelineTab, CandidateListView,
  InterviewSchedulerView, JobRequisitionsView,
  RecruitingAnalyticsView, RecruitmentCopilotView, OnboardingTrackerView,
  SourcingCrmView, OfferManagementView, ClientWorkspacesView, VendorManagementView,
  AccessGovernanceView, SalesCrmView, BenchManagementView, DeliveryCommandCenterView
} from './components/recruiter-workspace';
import { persistCandidateSourceArtifact, persistCandidateParseHistory, reprocessCandidateFromSource } from './components/recruiter-workspace/candidateArtifactStore';

const DEFAULT_REAL_CANDIDATES: Candidate[] = [];

const generateFullEnterpriseJD = (title: string, clientName?: string, location?: string, department?: string, existingJd?: string): string => {
  if (existingJd && existingJd.includes('ENTERPRISE REQUISITION JOB DESCRIPTION')) {
    return existingJd;
  }

  const client = clientName || 'Direct Account';
  const loc = location || 'Bangalore / Remote';
  const dept = department || 'Engineering Operations';

  return `====================================================================
ENTERPRISE REQUISITION JOB DESCRIPTION (JD)
====================================================================
Position Title : ${title}
Client Account : ${client}
Department     : ${dept}
Target Location: ${loc}
Employment Type: Full-time / Enterprise Staffing
Requisition SLA: High Priority

1. EXECUTIVE SUMMARY & POSITION OVERVIEW
--------------------------------------------------------------------
${client} is seeking an experienced professional for the position of ${title} within the ${dept} division located in ${loc}. 
The primary objective of this role is to drive mission-critical technical execution, maintain system health, and deliver scalable enterprise outcomes under strict client SLAs.

2. KEY RESPONSIBILITIES & DAILY OPERATIONS
--------------------------------------------------------------------
• Lead daily technical delivery, architecture implementation, and operations for ${title}.
• Collaborate closely with cross-functional product, delivery, and client engineering teams.
• Maintain zero-downtime compliance, execute automated testing/deployment pipelines, and generate shift performance reports.
• Mentor junior engineers, document technical SOPs, and adhere strictly to enterprise governance guidelines.

3. TECHNICAL REQUIREMENTS & CORE COMPETENCIES
--------------------------------------------------------------------
• Demonstrated proficiency in core domain technologies relevant to ${title}.
• Strong problem-solving, analytical troubleshooting, and system design capability.
• Experience with modern cloud platforms (AWS/Azure/GCP), CI/CD automation, and API integrations.
• Excellent verbal and written communication skills for client-facing technical discussions.

4. SELECTION SLA & RECRUITMENT TIMELINE
--------------------------------------------------------------------
• Round 1: AI Dossier & Skill Screening (24 Hours)
• Round 2: Deep Technical & System Design Assessment (48 Hours)
• Round 3: Client Account SPOC Approval & Offer Signoff (24 Hours)

${existingJd ? `Original Input:\n${existingJd}\n` : ''}====================================================================`;
};

export const RecruiterWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TosTab>(() => {
    try { return (sessionStorage.getItem('chatr_tos_tab') as TosTab) ?? 'dashboard'; } catch { return 'dashboard'; }
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [importJobOpen, setImportJobOpen] = useState(false);
  const [importCvOpen, setImportCvOpen] = useState(false);
  const [activeClientFilter, setActiveClientFilter] = useState<string | null>(null);

  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('chatr_rec_candidates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(enrichCandidateData);
        }
      }
    } catch (e) {
      console.warn('[Candidates Hydration Error]:', e);
    }
    return DEFAULT_REAL_CANDIDATES.map(enrichCandidateData);
  });
  const [automationEvents, setAutomationEvents] = useState<AutomationEvent[]>([]);
  const [mobileActions, setMobileActions] = useState<MobileAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [automationBusy, setAutomationBusy] = useState<string | null>(null);

  // Auto-persist candidates state to localStorage whenever candidates change
  useEffect(() => {
    try {
      if (candidates && candidates.length > 0) {
        localStorage.setItem('chatr_rec_candidates', JSON.stringify(candidates));
      }
    } catch (e) {
      console.warn('[Candidates Persist Error]:', e);
    }
  }, [candidates]);

  const fetchData = useCallback(async () => {
    try {
      const [reqsRes, candsRes] = await Promise.all([
        supabase.from('rec_jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('rec_candidates').select('*').order('created_at', { ascending: false }),
      ]);
      // Wipe legacy mock jobs on initial load if any exist
      if (reqsRes.data && reqsRes.data.length > 0) {
        // Filter out legacy unformatted demo jobs
        const validCustomJobs = reqsRes.data
          .filter((r: any) => r.description && r.description.includes('ENTERPRISE REQUISITION JOB DESCRIPTION'))
          .map((r: any) => ({
            id: r.id, title: r.title, department: r.department, location: r.location,
            type: r.type, status: r.status, jd: r.description || '', created_at: r.created_at,
            client_name: r.client_name || 'Direct Account',
          }));
        setRequisitions(validCustomJobs);
      } else {
        setRequisitions([]);
      }

      if (candsRes.data && candsRes.data.length > 0) {
        const fetched = candsRes.data
          .filter((c: any) => c.email && !c.email.includes('@example.com'))
          .map((c: any) => ({
            id: c.id, first_name: c.first_name, last_name: c.last_name,
            email: c.email, phone: c.phone, status: c.stage || 'Applied',
            applied_for: c.job_id, created_at: c.created_at,
            ai_match: c.ai_score, priority: 'High' as const, risk: 'Low' as const,
            salary_fit: 'Within Band' as const,
            current_company: c.current_company,
            current_designation: c.current_designation,
            location: c.location,
            skills: c.skills || [],
            experience_years: c.experience_years,
            expected_ctc: c.expected_ctc,
            current_ctc: c.current_ctc,
            notice_days: c.notice_days,
            serving_notice: c.serving_notice,
            source_artifact: c.intelligence_artifact,
          }));

        setCandidates(prev => {
          const fetchedEmails = new Set(fetched.map((f: Candidate) => (f.email || '').toLowerCase()));
          const localOnly = prev.filter(p => p.email && !fetchedEmails.has(p.email.toLowerCase()));
          const merged = [...fetched, ...localOnly];
          try { localStorage.setItem('chatr_rec_candidates', JSON.stringify(merged)); } catch {}
          return merged;
        });
      }
    } finally { setLoading(false); }
  }, []);

  const fetchAutomation = useCallback(async () => {
    try {
      const [eventsRes, actionsRes] = await Promise.all([
        supabase.from('rec_automation_events').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('rec_mobile_actions').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      if (eventsRes.data) setAutomationEvents(eventsRes.data.map((e: any) => ({ id: e.id, event_type: e.event_type, payload: e.payload, created_at: e.created_at })));
      if (actionsRes.data) setMobileActions(actionsRes.data.map((a: any) => ({ id: a.id, action_type: a.action_type, payload: a.payload, status: a.status, created_at: a.created_at })));
    } catch (e) { console.error('Automation fetch failed', e); }
  }, []);

  useEffect(() => {
    fetchData();
    fetchAutomation();
  }, [fetchData, fetchAutomation]);

  const handleTabChange = useCallback((tab: TosTab) => {
    setActiveTab(tab);
    try { sessionStorage.setItem('chatr_tos_tab', tab); } catch {}
  }, []);

  const handleCreateRequisition = useCallback(async (reqData: Partial<Requisition>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const title = reqData.title || 'Untitled Role';
    const loc = reqData.location || 'Remote';
    const dept = reqData.department || 'Engineering Operations';
    const client = reqData.client_name || 'Direct Account';
    
    // Always format with full 6-section Enterprise JD
    const fullJd = generateFullEnterpriseJD(title, client, loc, dept, reqData.jd);

    if (reqData.id) {
      setRequisitions(prev => prev.map(r => r.id === reqData.id ? { ...r, ...reqData, jd: fullJd } as Requisition : r));
      await supabase.from('rec_jobs').update({
        title, location: loc, department: dept, type: reqData.type, status: reqData.status,
        description: fullJd,
      }).eq('id', reqData.id);
      toast.success(`Updated Requisition '${title}' with Full JD`);
    } else {
      const newJob: Requisition = {
        id: `req-${Date.now()}`, title, location: loc, department: dept,
        type: reqData.type || 'Full-time', status: 'Open', client_name: client,
        jd: fullJd, created_at: new Date().toISOString(),
      };
      setRequisitions(prev => [newJob, ...prev]);
      await supabase.from('rec_jobs').insert({
        user_id: user?.id, title: newJob.title, location: newJob.location,
        department: newJob.department, type: newJob.type, status: newJob.status,
        description: newJob.jd,
      });
      toast.success(`Published '${newJob.title}' with Full Enterprise JD`);
    }
  }, []);

  const handleImportJobs = useCallback(async (jobs: Partial<Requisition>[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    const formatted: Requisition[] = jobs.map((j, i) => {
      const title = j.title || 'Imported Requisition';
      const loc = j.location || 'Remote';
      const dept = j.department || 'Engineering Operations';
      const client = j.client_name || 'Direct Account';
      const fullJd = generateFullEnterpriseJD(title, client, loc, dept, j.jd);
      return {
        id: `imported-req-${Date.now()}-${i}`,
        title, location: loc, department: dept, type: j.type || 'Full-time',
        status: 'Open', client_name: client, jd: fullJd, created_at: new Date().toISOString(),
      };
    });
    setRequisitions(prev => [...formatted, ...prev]);
    for (const job of formatted) {
      await supabase.from('rec_jobs').insert({
        user_id: user?.id, title: job.title, location: job.location,
        department: job.department, type: job.type, status: job.status, description: job.jd,
      });
    }
    toast.success(`Imported ${formatted.length} jobs with Full Enterprise JDs`);
  }, []);

  const handleImportCandidate = useCallback(async (candidateData: Partial<Candidate>, originalFile?: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const fname = candidateData.first_name || 'Unknown';
    const lname = candidateData.last_name || '';
    const generatedEmail = candidateData.email || '';
    const company = candidateData.current_company || undefined;
    const exp = candidateData.experience_years;
    const loc = candidateData.location || undefined;

    const dynamicHistory = candidateData.work_history || [];
    /*
      {
        company: company || 'Current Employer',
        role: candidateData.current_designation || 'Specialist',
        start_year: '2023',
        end_year: 'Present',
        ctc: candidateData.current_ctc ? `₹${candidateData.current_ctc} LPA` : 'Not Specified',
        reason_for_leaving: 'Career Growth'
      }
    ]; */

    const newCand: Candidate = {
      id: crypto.randomUUID(),
      first_name: fname,
      last_name: lname,
      email: generatedEmail,
      phone: candidateData.phone || null,
      status: 'Applied', applied_for: candidateData.applied_for || null,
      current_company: company,
      current_designation: candidateData.current_designation || undefined,
      experience_years: exp,
      expected_ctc: candidateData.expected_ctc,
      current_ctc: candidateData.current_ctc,
      notice_days: candidateData.notice_days,
      serving_notice: candidateData.serving_notice,
      location: loc,
      skills: candidateData.skills || [],
      ai_match: candidateData.ai_match,
      ai_matched_skills: candidateData.ai_matched_skills || [],
      ai_missing_skills: candidateData.ai_missing_skills || [],
      priority: candidateData.priority,
      risk: candidateData.risk,
      salary_fit: candidateData.salary_fit,
      work_history: dynamicHistory,
      documents: candidateData.documents,
      evidence_sufficiency: candidateData.evidence_sufficiency,
      traceability_matrix: candidateData.traceability_matrix,
      academic_profile: candidateData.academic_profile,
      source_artifact: candidateData.source_artifact,
      created_at: new Date().toISOString(),
    };
    try {
      newCand.source_artifact = await persistCandidateSourceArtifact(newCand.id, newCand.source_artifact, originalFile);
    } catch (error) {
      console.warn('[Candidate Source Artifact Persist Error]:', error);
    }
    setCandidates(prev => [newCand, ...prev]);
    publishTOSEvent({ type: 'CandidateApplied', candidateId: newCand.id,
      candidateName: `${newCand.first_name} ${newCand.last_name}`,
      timestamp: new Date(), actor: 'AI CV Parser' });
    const { error: candidateInsertError } = await supabase.from('rec_candidates').insert({
      id: newCand.id,
      user_id: user?.id,
      job_id: newCand.applied_for,
      first_name: newCand.first_name, last_name: newCand.last_name,
      email: newCand.email, phone: newCand.phone,
      stage: 'Applied', source: 'Import',
      current_company: newCand.current_company,
      current_designation: newCand.current_designation,
      location: newCand.location,
      skills: newCand.skills,
      experience_years: newCand.experience_years,
      expected_ctc: newCand.expected_ctc,
      current_ctc: newCand.current_ctc,
      notice_days: newCand.notice_days,
      serving_notice: newCand.serving_notice,
      intelligence_artifact: newCand.source_artifact,
      parser_versions: newCand.source_artifact?.parser_versions,
    } as any);
    if (candidateInsertError) console.warn('[Candidate Persist Error]:', candidateInsertError);
    if (!candidateInsertError && newCand.source_artifact) {
      try {
        await persistCandidateParseHistory(newCand.id, newCand.source_artifact);
      } catch (error) {
        console.warn('[Candidate Parse History Persist Error]:', error);
      }
    }
    toast.success(`CV Parsed & Imported: ${newCand.first_name} ${newCand.last_name} (${newCand.email})`);
  }, []);

  const handleImportBatchCandidates = useCallback((items: Array<{ candidateData: Partial<Candidate>; originalFile?: File }>) => {
    const newCandidates: Candidate[] = items.map(({ candidateData, originalFile }) => {
      let fname = candidateData.first_name || '';
      let lname = candidateData.last_name || '';
      if (!fname && !lname && originalFile?.name) {
        const baseName = originalFile.name.replace(/\.[^/.]+$/, '').replace(/^[A-Za-z]+_/, '');
        const nameParts = baseName.split(/[\s_\-]+/);
        fname = nameParts[0] || 'Candidate';
        lname = nameParts.slice(1).join(' ') || '';
      }
      const generatedEmail = candidateData.email || `${fname.toLowerCase().replace(/[^a-z0-9]/g, '')}.${lname.toLowerCase().replace(/[^a-z0-9]/g, '') || Math.floor(Math.random()*10000)}@applicant.com`;
      
      const rawComp = candidateData.current_company;
      const company = (rawComp && rawComp !== 'Employer Unverified') ? rawComp : undefined;
      const loc = candidateData.location || undefined;
      const exp = candidateData.experience_years;

      const cand: Candidate = {
        id: crypto.randomUUID(),
        first_name: fname || 'Candidate',
        last_name: lname,
        email: generatedEmail,
        phone: candidateData.phone || null,
        status: 'Applied',
        applied_for: candidateData.applied_for || null,
        current_company: company,
        current_designation: candidateData.current_designation || undefined,
        experience_years: exp,
        expected_ctc: candidateData.expected_ctc,
        current_ctc: candidateData.current_ctc,
        notice_days: candidateData.notice_days,
        serving_notice: candidateData.serving_notice,
        location: loc,
        skills: candidateData.skills || [],
        ai_match: candidateData.ai_match,
        ai_matched_skills: candidateData.ai_matched_skills || [],
        ai_missing_skills: candidateData.ai_missing_skills || [],
        priority: candidateData.priority || 'High',
        risk: candidateData.risk || 'Low',
        salary_fit: candidateData.salary_fit || 'Within Band',
        work_history: candidateData.work_history || [],
        documents: candidateData.documents,
        evidence_sufficiency: candidateData.evidence_sufficiency,
        traceability_matrix: candidateData.traceability_matrix,
        academic_profile: candidateData.academic_profile,
        source_artifact: candidateData.source_artifact,
        created_at: new Date().toISOString(),
      };
      return enrichCandidateData(cand);
    });

    setCandidates(prev => {
      const merged = [...newCandidates, ...prev];
      try {
        localStorage.setItem('chatr_rec_candidates', JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to save batch candidates to localStorage', e);
      }
      return merged;
    });

    toast.success(`Batch Ingestion Complete: ${newCandidates.length} candidate CVs added to workspace!`);
  }, []);

  const handleClearCandidates = useCallback(() => {
    setCandidates([]);
    try {
      localStorage.removeItem('chatr_rec_candidates');
    } catch (e) {
      console.warn('Failed to clear candidate local cache', e);
    }
    toast.success('Cleared candidate seed data & local cache! Ready for fresh CV imports.');
  }, []);

  const handleReprocessCandidate = useCallback(async (candidate: Candidate) => {
    try {
      const reprocessed = await reprocessCandidateFromSource(candidate);
      setCandidates(previous => previous.map(item => item.id === candidate.id ? reprocessed : item));
      await supabase.from('rec_candidates').update({
        intelligence_artifact: reprocessed.source_artifact,
        parser_versions: reprocessed.source_artifact?.parser_versions,
        parser_updated_at: new Date().toISOString(),
      } as any).eq('id', candidate.id);
      if (reprocessed.source_artifact) await persistCandidateParseHistory(candidate.id, reprocessed.source_artifact);
      toast.success(`Reprocessed ${reprocessed.first_name || 'candidate'} with the current parser.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reprocess this candidate.');
    }
  }, []);

  const handlePositiveResponse = useCallback(async (candidate: Candidate) => {
    setAutomationBusy(`positive-${candidate.id}`);
    try {
      await simulatePositiveRecruitmentResponse(candidate);
      toast.success('Response queued');
    } catch { toast.error('Routing failed'); }
    finally { setAutomationBusy(null); }
  }, []);

  const handleInterviewScheduled = useCallback(async (candidate: Candidate) => {
    setAutomationBusy(`scheduled-${candidate.id}`);
    try {
      await markRecruitmentCallInterviewScheduled(candidate);
      toast.success('Interview scheduled');
    } catch { toast.error('Scheduling failed'); }
    finally { setAutomationBusy(null); }
  }, []);

  const handleStageChange = useCallback(async (candidateId: string, newStage: CandidateStage) => {
    setCandidates(c => c.map(x => x.id === candidateId ? { ...x, status: newStage } : x));
    toast.success(`Moved to ${newStage}`);
    if (!candidateId.startsWith('demo-') && !candidateId.startsWith('cand-')) {
      await supabase.from('rec_candidates').update({ stage: newStage }).eq('id', candidateId);
    }
  }, []);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const activeCandidates = candidates;

  return (
    <div className="flex-1 min-h-0 h-full w-full bg-slate-50 dark:bg-[#090A0F] overflow-hidden flex flex-col relative">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onTabChange={t => { handleTabChange(t); setCmdOpen(false); }} candidates={activeCandidates} requisitions={requisitions} />
      <ImportJobModal open={importJobOpen} onClose={() => setImportJobOpen(false)} onImport={handleImportJobs} />
      <ImportCVModal open={importCvOpen} onClose={() => setImportCvOpen(false)} onImportCandidate={handleImportCandidate} onImportBatchCandidates={handleImportBatchCandidates} requisitions={requisitions} />
      
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          requisitions={requisitions}
          onClose={() => setSelectedCandidate(null)}
          onPositiveResponse={handlePositiveResponse}
          onInterviewScheduled={handleInterviewScheduled}
          automationBusy={automationBusy}
        />
      )}

      <TabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCmdK={() => setCmdOpen(true)}
        onOpenImportJob={() => setImportJobOpen(true)}
        onOpenImportCv={() => setImportCvOpen(true)}
        candidates={activeCandidates}
        requisitions={requisitions}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'dashboard' && <DashboardTab requisitions={requisitions} candidates={candidates} automationEvents={automationEvents} loading={loading} automationBusy={automationBusy} onPositiveResponse={handlePositiveResponse} onInterviewScheduled={handleInterviewScheduled} onNewJob={() => handleTabChange('jobs')} onCreateJob={handleCreateRequisition} onOpenImportCv={() => setImportCvOpen(true)} onSelectTab={handleTabChange} />}
        {activeTab === 'clients' && <ClientWorkspacesView candidates={candidates} requisitions={requisitions} activeClientFilter={activeClientFilter} onSelectClientWorkspace={id => setActiveClientFilter(id)} />}
        {activeTab === 'sourcing' && <SourcingCrmView candidates={candidates} requisitions={requisitions} onOpenImportCv={() => setImportCvOpen(true)} onSelectCandidate={c => setSelectedCandidate(c)} />}
        {activeTab === 'pipeline' && <PipelineTab candidates={candidates} requisitions={requisitions} loading={loading} onStageChange={handleStageChange} onViewCandidate={c => setSelectedCandidate(c)} onOpenImportCv={() => setImportCvOpen(true)} />}
        {activeTab === 'candidates' && <CandidateListView candidates={candidates} requisitions={requisitions} loading={loading} onPositiveResponse={handlePositiveResponse} onInterviewScheduled={handleInterviewScheduled} automationBusy={automationBusy} onOpenImportCv={() => setImportCvOpen(true)} onClearCandidates={handleClearCandidates} onReprocessCandidate={handleReprocessCandidate} />}
        {activeTab === 'interviews' && <InterviewSchedulerView candidates={candidates} onSelectCandidate={c => setSelectedCandidate(c)} />}
        {activeTab === 'jobs' && <JobRequisitionsView requisitions={requisitions} candidates={candidates} loading={loading} onCreate={handleCreateRequisition} onOpenImportJob={() => setImportJobOpen(true)} />}
        {activeTab === 'offers' && <OfferManagementView candidates={candidates} requisitions={requisitions} onSelectCandidate={c => setSelectedCandidate(c)} />}
        {activeTab === 'vendors' && <VendorManagementView candidates={candidates} requisitions={requisitions} />}
        {activeTab === 'analytics' && <RecruitingAnalyticsView candidates={activeCandidates} requisitions={requisitions} />}
        {activeTab === 'governance' && <AccessGovernanceView />}
        {activeTab === 'copilot' && <RecruitmentCopilotView candidates={candidates} requisitions={requisitions} />}
        {activeTab === 'onboarding' && <OnboardingTrackerView />}
        {activeTab === 'sales' && <SalesCrmView />}
        {activeTab === 'bench' && <BenchManagementView candidates={candidates} onSelectCandidate={c => setSelectedCandidate(c)} />}
        {activeTab === 'delivery' && <DeliveryCommandCenterView />}
      </div>

      <FloatingAIAssistant candidates={activeCandidates} requisitions={requisitions} />
    </div>
  );
};

export default RecruiterWorkspace;
