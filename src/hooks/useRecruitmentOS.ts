/**
 * useRecruitmentOS — real-time data layer for the Recruitment workspace.
 *
 * Reads from rec_jobs, rec_candidates, rec_interviews, rec_offer_letters.
 * Subscribes to Supabase realtime for live pipeline updates.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/* ── Types ─────────────────────────────────────────────────── */

export type CandidateStage =
  | 'Applied' | 'Screening' | 'Assessment'
  | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export type JobStatus = 'Open' | 'Paused' | 'Closed' | 'Draft';

export interface RecJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  type: string;
  status: JobStatus;
  description: string | null;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  openings: number;
  created_at: string;
  updated_at: string;
}

export interface RecCandidate {
  id: string;
  job_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  resume_url: string | null;
  linkedin_url: string | null;
  stage: CandidateStage;
  rating: number;
  ai_score: number | null;
  ai_summary: string | null;
  notes: string | null;
  source: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RecInterview {
  id: string;
  candidate_id: string;
  job_id: string | null;
  scheduled_at: string;
  duration_min: number;
  interview_type: string;
  meet_link: string | null;
  status: string;
  feedback: string | null;
  outcome: string | null;
  created_at: string;
}

export interface RecOfferLetter {
  id: string;
  candidate_id: string;
  job_id: string | null;
  offer_text: string;
  salary_offered: number | null;
  currency: string;
  start_date: string | null;
  expiry_date: string | null;
  status: string;
  sent_at: string | null;
  created_at: string;
}

/* ── Jobs hook ─────────────────────────────────────────────── */

export function useRecJobs() {
  const [jobs, setJobs] = useState<RecJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('rec_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setJobs(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const channel = supabase
      .channel('rec_jobs_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rec_jobs' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const createJob = useCallback(async (job: Partial<RecJob>): Promise<RecJob | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('rec_jobs')
      .insert({ ...job, user_id: user.id })
      .select()
      .single();
    if (error) { console.error('[useRecJobs] create:', error); return null; }
    return data;
  }, []);

  const updateJob = useCallback(async (id: string, updates: Partial<RecJob>) => {
    const { error } = await supabase.from('rec_jobs').update(updates).eq('id', id);
    if (error) console.error('[useRecJobs] update:', error);
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    const { error } = await supabase.from('rec_jobs').delete().eq('id', id);
    if (error) console.error('[useRecJobs] delete:', error);
  }, []);

  return { jobs, loading, createJob, updateJob, deleteJob, refetch: fetch };
}

/* ── Candidates hook ───────────────────────────────────────── */

export function useRecCandidates(jobId?: string) {
  const [candidates, setCandidates] = useState<RecCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let query = supabase
      .from('rec_candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (jobId) query = query.eq('job_id', jobId);

    const { data, error } = await query;
    if (!error) setCandidates((data ?? []).map(c => ({ ...c, tags: c.tags ?? [] })));
    setLoading(false);
  }, [jobId]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const channel = supabase
      .channel('rec_candidates_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rec_candidates' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const createCandidate = useCallback(async (candidate: Partial<RecCandidate>): Promise<RecCandidate | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('rec_candidates')
      .insert({ ...candidate, user_id: user.id })
      .select()
      .single();
    if (error) { console.error('[useRecCandidates] create:', error); return null; }
    return data;
  }, []);

  const updateStage = useCallback(async (id: string, stage: CandidateStage) => {
    const { error } = await supabase
      .from('rec_candidates')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error('[useRecCandidates] updateStage:', error);
    // Optimistic update
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
  }, []);

  const updateCandidate = useCallback(async (id: string, updates: Partial<RecCandidate>) => {
    const { error } = await supabase
      .from('rec_candidates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) console.error('[useRecCandidates] update:', error);
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCandidate = useCallback(async (id: string) => {
    const { error } = await supabase.from('rec_candidates').delete().eq('id', id);
    if (error) console.error('[useRecCandidates] delete:', error);
  }, []);

  // Group by pipeline stage for kanban
  const byStage = useCallback((): Record<CandidateStage, RecCandidate[]> => {
    const stages: CandidateStage[] = ['Applied','Screening','Assessment','Interview','Offer','Hired','Rejected'];
    return stages.reduce((acc, stage) => {
      acc[stage] = candidates.filter(c => c.stage === stage);
      return acc;
    }, {} as Record<CandidateStage, RecCandidate[]>);
  }, [candidates]);

  return { candidates, loading, byStage, createCandidate, updateStage, updateCandidate, deleteCandidate, refetch: fetch };
}

/* ── Interviews hook ───────────────────────────────────────── */

export function useRecInterviews(candidateId?: string) {
  const [interviews, setInterviews] = useState<RecInterview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    let query = supabase
      .from('rec_interviews')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (candidateId) query = query.eq('candidate_id', candidateId);

    const { data, error } = await query;
    if (!error) setInterviews(data ?? []);
    setLoading(false);
  }, [candidateId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createInterview = useCallback(async (interview: Partial<RecInterview>): Promise<RecInterview | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('rec_interviews')
      .insert({ ...interview, user_id: user.id })
      .select()
      .single();
    if (error) { console.error('[useRecInterviews] create:', error); return null; }
    await fetch();
    return data;
  }, [fetch]);

  const updateInterview = useCallback(async (id: string, updates: Partial<RecInterview>) => {
    const { error } = await supabase.from('rec_interviews').update(updates).eq('id', id);
    if (error) console.error('[useRecInterviews] update:', error);
    await fetch();
  }, [fetch]);

  return { interviews, loading, createInterview, updateInterview, refetch: fetch };
}

/* ── Offer Letters hook ────────────────────────────────────── */

export function useRecOfferLetters() {
  const [offers, setOffers] = useState<RecOfferLetter[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('rec_offer_letters')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOffers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createOffer = useCallback(async (offer: Partial<RecOfferLetter>): Promise<RecOfferLetter | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('rec_offer_letters')
      .insert({ ...offer, user_id: user.id })
      .select()
      .single();
    if (error) { console.error('[useRecOfferLetters] create:', error); return null; }
    await fetch();
    return data;
  }, [fetch]);

  const updateOfferStatus = useCallback(async (id: string, status: string) => {
    const { error } = await supabase.from('rec_offer_letters').update({ status }).eq('id', id);
    if (error) console.error('[useRecOfferLetters] update:', error);
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  return { offers, loading, createOffer, updateOfferStatus, refetch: fetch };
}

/* ── Dashboard stats ───────────────────────────────────────── */

export function useRecruitmentStats() {
  const { jobs } = useRecJobs();
  const { candidates } = useRecCandidates();
  const { interviews } = useRecInterviews();

  const openJobs      = jobs.filter(j => j.status === 'Open').length;
  const totalApplicants = candidates.length;
  const inPipeline    = candidates.filter(c => !['Applied', 'Hired', 'Rejected'].includes(c.stage)).length;
  const hired         = candidates.filter(c => c.stage === 'Hired').length;
  const upcomingInterviews = interviews.filter(i => {
    return i.status === 'scheduled' && new Date(i.scheduled_at) > new Date();
  }).length;

  const hiringRate = totalApplicants > 0
    ? Math.round((hired / totalApplicants) * 100)
    : 0;

  const avgAiScore = candidates.filter(c => c.ai_score != null).length > 0
    ? Math.round(
        candidates.filter(c => c.ai_score != null).reduce((s, c) => s + (c.ai_score ?? 0), 0) /
        candidates.filter(c => c.ai_score != null).length
      )
    : 0;

  return {
    openJobs,
    totalApplicants,
    inPipeline,
    hired,
    upcomingInterviews,
    hiringRate,
    avgAiScore,
  };
}
