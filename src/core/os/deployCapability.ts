/**
 * deployCapability — Intent OS Deployment Bridge
 *
 * Does all work directly via supabase-js — no stored procedures,
 * no PL/pgSQL. Works with any Supabase project out of the box.
 *
 * Flow:
 *   1. Upsert into user_capability_installs
 *   2. Insert kernel event into os_events
 *   3. Seed domain data for first-time installs (e.g. RecruitmentOS)
 */

import { supabase } from '@/integrations/supabase/client';

export interface DeployCapabilityParams {
  capabilityId:   string;
  capabilityName: string;
  capabilityType: 'agent' | 'template' | 'connector' | 'workflow';
  workspacePath:  string;
  iconName?:      string;
  color?:         string;
  structure?:     string[];
  config?:        Record<string, unknown>;
  version?:       string;
}

export interface DeployResult {
  installId:    string;
  status:       'installed';
  capabilityId: string;
}

/* ── Main deploy function ─────────────────────────────────── */

export async function deployCapability(
  params: DeployCapabilityParams
): Promise<DeployResult> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  // 1. Upsert install record
  const { data: install, error: installErr } = await supabase
    .from('user_capability_installs')
    .upsert(
      {
        user_id:         user.id,
        capability_id:   params.capabilityId,
        capability_name: params.capabilityName,
        capability_type: params.capabilityType,
        workspace_path:  params.workspacePath,
        icon_name:       params.iconName   ?? 'Bot',
        color:           params.color      ?? 'indigo',
        structure:       params.structure  ?? [],
        config:          params.config     ?? {},
        version:         params.version    ?? '1.0.0',
        status:          'installed',
        installed_at:    new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      },
      { onConflict: 'user_id,capability_id' }
    )
    .select('id')
    .single();

  if (installErr) {
    console.error('[deployCapability] install upsert failed:', installErr);
    throw new Error(installErr.message);
  }

  // 2. Fire kernel event (best-effort, non-blocking)
  supabase
    .from('os_events')
    .insert({
      event_type:       'capability.installed',
      level:            'info',
      source_subsystem: 'intent-store',
      payload: {
        install_id:      install.id,
        capability_id:   params.capabilityId,
        capability_name: params.capabilityName,
        user_id:         user.id,
        workspace_path:  params.workspacePath,
        version:         params.version ?? '1.0.0',
      },
    })
    .then(({ error }) => {
      if (error) console.warn('[deployCapability] kernel event failed:', error.message);
    });

  // 3. Seed domain data for first-time installs
  if (SEEDERS[params.capabilityId]) {
    await SEEDERS[params.capabilityId](user.id).catch(e =>
      console.warn('[deployCapability] seed skipped:', e?.message)
    );
  }

  return {
    installId:    install.id,
    status:       'installed',
    capabilityId: params.capabilityId,
  };
}

/* ── Uninstall ────────────────────────────────────────────── */

export async function uninstallCapability(capabilityId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('user_capability_installs')
    .update({ status: 'uninstalled', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('capability_id', capabilityId);

  if (error) throw new Error(error.message);

  // Fire kernel event (best-effort)
  supabase.from('os_events').insert({
    event_type: 'capability.uninstalled',
    level: 'info',
    source_subsystem: 'intent-store',
    payload: { capability_id: capabilityId, user_id: user.id },
  }).then(() => {});
}

/* ── Domain seeders ──────────────────────────────────────── */
// Each seeder runs once — checks if data already exists first.

const SEEDERS: Record<string, (userId: string) => Promise<void>> = {
  'recruitment-os':     seedRecruitmentOS,
  'recruitment-agency': seedRecruitmentOS,
};

async function seedRecruitmentOS(userId: string): Promise<void> {
  // Check if already seeded
  const { data: existing } = await supabase
    .from('rec_jobs')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return; // Already seeded

  // Generate job IDs upfront so candidates can reference them
  const job1Id = crypto.randomUUID();
  const job2Id = crypto.randomUUID();
  const job3Id = crypto.randomUUID();

  // Insert 3 demo jobs
  const { error: jobErr } = await supabase.from('rec_jobs').insert([
    {
      id: job1Id, user_id: userId,
      title: 'Senior Product Designer', department: 'Design',
      location: 'Remote', type: 'Full-time', status: 'Open',
      description: 'Lead product design, run user research and ship beautiful experiences.',
      openings: 2,
    },
    {
      id: job2Id, user_id: userId,
      title: 'Backend Engineer (Node.js)', department: 'Engineering',
      location: 'Bangalore', type: 'Full-time', status: 'Open',
      description: 'Build scalable APIs and microservices for our platform.',
      openings: 3,
    },
    {
      id: job3Id, user_id: userId,
      title: 'Sales Development Rep', department: 'Sales',
      location: 'Mumbai', type: 'Full-time', status: 'Open',
      description: 'Generate leads and qualify enterprise prospects.',
      openings: 5,
    },
  ]);

  if (jobErr) throw jobErr;

  // Insert 8 demo candidates
  await supabase.from('rec_candidates').insert([
    {
      user_id: userId, job_id: job2Id,
      first_name: 'Priya', last_name: 'Sharma', email: 'priya.sharma@example.com',
      stage: 'Screening', rating: 4, ai_score: 87.5,
      ai_summary: 'Strong match. 6 years Node.js. Previously at Razorpay.',
      source: 'LinkedIn',
    },
    {
      user_id: userId, job_id: job2Id,
      first_name: 'Rahul', last_name: 'Mehta', email: 'rahul.mehta@example.com',
      stage: 'Interview', rating: 5, ai_score: 92.0,
      ai_summary: 'Excellent. System design exceptional. Strongly recommended.',
      source: 'Referral',
    },
    {
      user_id: userId, job_id: job2Id,
      first_name: 'Sneha', last_name: 'Patil', email: 'sneha.patil@example.com',
      stage: 'Applied', rating: 3, ai_score: 71.0,
      ai_summary: 'Decent background. Missing microservices experience.',
      source: 'Direct',
    },
    {
      user_id: userId, job_id: job2Id,
      first_name: 'Arjun', last_name: 'Nair', email: 'arjun.nair@example.com',
      stage: 'Offer', rating: 5, ai_score: 95.0,
      ai_summary: 'Top performer. Competing offers. Move fast.',
      source: 'GitHub',
    },
    {
      user_id: userId, job_id: job2Id,
      first_name: 'Kavitha', last_name: 'Rajan', email: 'kavitha.rajan@example.com',
      stage: 'Assessment', rating: 4, ai_score: 83.0,
      ai_summary: 'Strong fundamentals. Needs a system design round.',
      source: 'LinkedIn',
    },
    {
      user_id: userId, job_id: job1Id,
      first_name: 'Meera', last_name: 'Iyer', email: 'meera.iyer@example.com',
      stage: 'Screening', rating: 4, ai_score: 88.0,
      ai_summary: 'Excellent portfolio. Figma skills strong. Great eng-design collaborator.',
      source: 'Behance',
    },
    {
      user_id: userId, job_id: job1Id,
      first_name: 'Rohan', last_name: 'Kapoor', email: 'rohan.kapoor@example.com',
      stage: 'Applied', rating: 3, ai_score: 74.0,
      ai_summary: 'Good visual design but limited product thinking.',
      source: 'Direct',
    },
    {
      user_id: userId, job_id: job3Id,
      first_name: 'Ananya', last_name: 'Singh', email: 'ananya.singh@example.com',
      stage: 'Interview', rating: 5, ai_score: 91.0,
      ai_summary: 'High energy, great communicator. Ex-Salesforce. Strong enterprise fit.',
      source: 'LinkedIn',
    },
  ]);
}
