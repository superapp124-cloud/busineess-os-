/**
 * CHATR Intent Observer — Client-side Pattern Engine
 *
 * Mirror of the backend patterns.cjs — runs instantly in the browser
 * so chips appear the moment the user hits send, with ZERO network latency.
 *
 * The backend /intent/observe call runs concurrently for persistence.
 *
 * 5-Second Rule: This runs in < 1ms.
 *
 * Genesis v0.2 — Codename: Observer
 */

import type { Understanding, IntentType } from './types';

const PATTERNS: Record<IntentType, RegExp[]> = {
  MEETING: [
    /\blet('?s| us) meet\b/i,
    /\bmeet (you|him|her|them|up)? ?(at|tomorrow|today|on|next|this)\b/i,
    /\b(schedule|arrange|set up|book) (a |the )?(meeting|call|zoom|catch[- ]?up|session)\b/i,
    /\b(coffee|lunch|dinner) (tomorrow|today|next|this (morning|afternoon|evening|week)|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i,
    /\b(zoom|video|teams|google meet) call\b/i,
    /\bcatch[- ]?up (tomorrow|next|this|on)\b/i,
    /\bmeet(ing)? at \d{1,2}(:\d{2})?\s*(am|pm)?\b/i,
    /\bjoin (me|us)? ?(for|on|at)? ?(a |the )?(call|meeting)\b/i,
  ],

  REMINDER: [
    /\bi('ll| will) (send|email|text|call|ping|share|submit|deliver|follow up|get back|reply|respond|reach out|circle back)\b/i,
    /\bi('ll| will) (do|finish|complete|review|check|update|prepare|handle|fix|write|deploy|push|release|publish|upload|book|confirm|pay|order|buy|file)\b/i,
    /\bremind me\b/i,
    /\bfollow[- ]?up (tomorrow|next|later|soon|by|before|after)\b/i,
    /\bdon't (let me )?forget (to|about)\b/i,
    /\bset (a |an )?(reminder|alarm|alert)\b/i,
    /\bi('ll| will) get back to you\b/i,
  ],

  CONTACT: [
    /(\+?(\d[\s\-.]?){9,}\d)/,
    /\b[\w.+\-]+@[\w\-]+\.[a-z]{2,6}\b/i,
    /\b(number|phone|email|whatsapp|contact|reach me|call me) (is|at|:)\s*[\w\s@.+\-]{5,}/i,
    /\badd (me|him|her|them) (to your contacts|as a contact)\b/i,
  ],

  TASK: [
    /\bi (need to|have to|must|got to|gotta|should) \w+/i,
    /\bwe (need to|have to|must|should) \w+/i,
    /\b(todo|to-do|to do):?\s+\w+/i,
    /\b(must|can'?t forget to|please) (remember to|don'?t forget to)?\s*\w+/i,
    /\b(action item|action required|assigned to)\b/i,
    /\bby (end of (day|week|month)|tomorrow|friday|monday)\b.{0,40}\b(done|complete|finished|ready|submitted)\b/i,
  ],
};

export function detectIntents(messageText: string): Partial<Understanding>[] {
  if (!messageText || messageText.trim().length < 8) return [];

  const detections: Partial<Understanding>[] = [];

  for (const [intentType, patterns] of Object.entries(PATTERNS) as [IntentType, RegExp[]][]) {
    let score = 0;
    const matched: string[] = [];

    for (const pattern of patterns) {
      const m = messageText.match(pattern);
      if (m) {
        score++;
        matched.push(m[0].substring(0, 60));
      }
    }

    if (score === 0) continue;

    const observationConfidence = score === 1 ? 0.70 : score === 2 ? 0.85 : 0.95;

    detections.push({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      type: intentType,
      confidence: {
        observation: observationConfidence,
        meaning: 0.3,
        execution: 0
      },
      source: 'regex',
      readyForSuggestion: true // UI chips should show up immediately
    });
  }

  return detections.sort((a, b) => (b.confidence?.observation || 0) - (a.confidence?.observation || 0));
}
