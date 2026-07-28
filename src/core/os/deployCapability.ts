/**
 * deployCapability — The Intent OS Deployment Bridge
 *
 * This is the single function that makes the Intent Store real.
 * It calls the install_capability() Supabase RPC which atomically:
 *   1. Writes to user_capability_installs
 *   2. Fires a kernel event into os_events
 *
 * Optionally seeds demo data for first-time installs (RecruitmentOS).
 */

import { supabase } from '@/integrations/supabase/client';

export interface DeployCapabilityParams {
  capabilityId:   string;    // e.g. 'recruitment-os'
  capabilityName: string;    // e.g. 'RecruitmentOS'
  capabilityType: 'agent' | 'template' | 'connector' | 'workflow';
  workspacePath:  string;    // e.g. '/desktop/recruitment'
  iconName?:      string;    // lucide icon name
  color?:         string;    // tailwind color e.g. 'blue'
  structure?:     string[];  // workspace sections e.g. ['Dashboard', 'Pipeline']
  config?:        Record<string, unknown>;
  version?:       string;
}

export interface DeployResult {
  installId:    string;
  status:       'installed';
  capabilityId: string;
}

/** Seeds demo data for supported modules on first install */
const SEEDABLE_MODULES: Record<string, string> = {
  'recruitment-os':      'seed_recruitment_demo',
  'recruitment-agency':  'seed_recruitment_demo',
};

export async function deployCapability(params: DeployCapabilityParams): Promise<DeployResult> {
  const { data, error } = await supabase.rpc('install_capability', {
    p_capability_id:   params.capabilityId,
    p_capability_name: params.capabilityName,
    p_capability_type: params.capabilityType,
    p_workspace_path:  params.workspacePath,
    p_icon_name:       params.iconName ?? 'Bot',
    p_color:           params.color ?? 'indigo',
    p_structure:       params.structure ?? [],
    p_config:          params.config ?? {},
    p_version:         params.version ?? '1.0.0',
  });

  if (error) {
    console.error('[deployCapability] RPC error:', error);
    throw new Error(error.message);
  }

  // Seed domain data for this module if a seeder exists
  const seederFn = SEEDABLE_MODULES[params.capabilityId];
  if (seederFn) {
    try {
      await supabase.rpc(seederFn as any);
    } catch (seedErr) {
      // Non-fatal — seeding is best-effort
      console.warn('[deployCapability] Seeding skipped:', seedErr);
    }
  }

  return data as DeployResult;
}

export async function uninstallCapability(capabilityId: string): Promise<void> {
  const { error } = await supabase.rpc('uninstall_capability', {
    p_capability_id: capabilityId,
  });
  if (error) throw new Error(error.message);
}
