/**
 * CHATR 100% AUTOMATED OUTBOUND EMAIL ENGINE (RESEND & BREVO COMPATIBLE)
 * 
 * Manages automated cold email delivery for Squad 2 using verified custom domain identities
 * (sarah.talent@chatrchat.in, alex.growth@chatrchat.in) with zero runtime dependencies.
 */

import { supabase } from '../../integrations/supabase/client';
import { ScrapedLeadRecord, getSavedScrapedLeads } from '../agents/autonomousScraperEngine';

export interface EmailOutboundTemplate {
  id: string;
  name: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  generateBodyHtml: (lead: ScrapedLeadRecord) => string;
  targetVertical: string;
}

const STORAGE_KEY_RESEND_KEY = 'chatr_resend_api_key_v1';

export const OUTBOUND_EMAIL_PERSONAS: EmailOutboundTemplate[] = [
  {
    id: 'persona_sarah_ats',
    name: 'Sarah Jenkins (Recruitment & ATS Screening)',
    senderName: 'Sarah Jenkins | Talent Operations',
    senderEmail: 'sarah.talent@chatrchat.in',
    subject: 'Quick question regarding hiring at {{company_name}}',
    targetVertical: 'Recruitment & Staffing Agencies',
    generateBodyHtml: (lead) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
        <p>Hi ${lead.decisionMakerName || 'there'},</p>
        
        <p>I noticed ${lead.companyName} is actively placing candidates in <strong>${lead.city}</strong>.</p>
        
        <p>We built a 100% free <strong>AI ATS Resume Grader & Pre-Screening Tool</strong> specifically for recruitment and staffing teams:</p>
        
        <p style="margin: 24px 0;">
          <a href="https://www.chatrchat.in/tools/resume-grader" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            👉 Try Free AI Resume Grader &rarr;
          </a>
        </p>
        
        <p style="font-size: 13px; color: #64748b;">
          Zero signup, no credit card, and instant ATS scorecards with candidate skill breakdown.
        </p>
        
        <p>Would love to hear if this helps speed up your initial candidate screening process.</p>
        
        <p style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <strong>Sarah Jenkins</strong><br>
          <span style="color: #64748b; font-size: 13px;">Talent Operations &bull; CHATR TalentXcel</span><br>
          <span style="color: #94a3b8; font-size: 11px;">https://www.chatrchat.in &bull; Dubai &bull; Mumbai &bull; London</span>
        </p>
      </div>
    `
  },
  {
    id: 'persona_alex_sme',
    name: 'Alex Rivera (SME & Real Estate Lead Triage)',
    senderName: 'Alex Rivera | Growth Solutions',
    senderEmail: 'alex.growth@chatrchat.in',
    subject: 'WhatsApp response time calculation for {{company_name}}',
    targetVertical: 'Real Estate Brokerages & Clinics',
    generateBodyHtml: (lead) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6;">
        <p>Hi ${lead.decisionMakerName || 'Team'},</p>
        
        <p>We created a free <strong>WhatsApp Response SLA & Lead Leak Calculator</strong> for businesses in <strong>${lead.city}</strong>:</p>
        
        <p style="margin: 24px 0;">
          <a href="https://www.chatrchat.in/tools/sla-calculator" style="background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            📊 Calculate Lead Revenue Leakage &rarr;
          </a>
        </p>
        
        <p>Also, if your team needs free click-to-chat WhatsApp QR links with pre-filled messages: <a href="https://www.chatrchat.in/tools/whatsapp-link-generator">https://www.chatrchat.in/tools/whatsapp-link-generator</a>.</p>
        
        <p style="margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <strong>Alex Rivera</strong><br>
          <span style="color: #64748b; font-size: 13px;">Growth Solutions &bull; CHATR Business OS</span>
        </p>
      </div>
    `
  }
];

export function getSavedResendApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_RESEND_KEY) || '';
  } catch {
    return '';
  }
}

export function saveResendApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_RESEND_KEY, key.trim());
}

// Send automated email via Resend REST API (Zero external npm dependency)
export async function sendEmailViaResend(options: {
  apiKey?: string;
  from?: string;
  to: string;
  subject: string;
  html: string;
  leadId?: string;
  companyName?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = options.apiKey || getSavedResendApiKey();
  if (!apiKey) {
    return { success: false, error: 'Resend API Key is not configured. Add your free Resend key in settings.' };
  }

  const fromAddress = options.from || 'Sarah Jenkins <sarah.talent@chatrchat.in>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html
      })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || `Resend Error HTTP ${res.status}` };
    }

    // Log successful email to Supabase os_events
    try {
      await supabase.from('os_events').insert({
        event_type: 'agent.email.dispatched',
        level: 'info',
        source_subsystem: 'resend-email-engine',
        payload: {
          resend_id: data.id,
          to: options.to,
          company: options.companyName,
          from: fromAddress,
          subject: options.subject,
          lead_id: options.leadId
        }
      });
    } catch {}

    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error while contacting Resend API' };
  }
}

// Dispatch automated outbound email batch to all discovered company leads
export async function dispatchAutomatedEmailBatch(
  personaId: string = 'persona_sarah_ats'
): Promise<{ totalAttempted: number; delivered: number; errors: string[] }> {
  const leads = getSavedScrapedLeads();
  const persona = OUTBOUND_EMAIL_PERSONAS.find(p => p.id === personaId) || OUTBOUND_EMAIL_PERSONAS[0];
  const apiKey = getSavedResendApiKey();

  let delivered = 0;
  const errors: string[] = [];

  for (const lead of leads) {
    if (lead.email) {
      const subject = persona.subject.replace('{{company_name}}', lead.companyName);
      const html = persona.generateBodyHtml(lead);

      const res = await sendEmailViaResend({
        apiKey,
        from: `${persona.senderName} <${persona.senderEmail}>`,
        to: lead.email,
        subject,
        html,
        leadId: lead.id,
        companyName: lead.companyName
      });

      if (res.success) {
        delivered++;
      } else if (res.error) {
        errors.push(`${lead.companyName} (${lead.email}): ${res.error}`);
      }
    }
  }

  return { totalAttempted: leads.length, delivered, errors };
}
