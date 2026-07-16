'use strict';

/**
 * CHATR Kernel — Planner (Phase 5.1)
 *
 * Architectural Principle: The Planner NEVER knows providers.
 * The Planner NEVER invents constraint values.
 * The Planner ONLY extracts intent type + explicitly stated constraints.
 *
 * Pipeline:
 *   User Text → Planner → { intent, constraints }
 *                              ↓
 *                   Intent Intelligence Engine
 *                   (enriches, validates, asks)
 */

'use strict';

class Planner {
  /**
   * Extract intent type and explicitly stated constraints from user text.
   * Returns ONLY what the user actually said — no fallbacks, no invented values.
   *
   * @param {string} intentText
   * @returns {object} { intent, constraints }
   */
  plan(intentText) {
    const lower = intentText.toLowerCase();
    const constraints = {};

    // ── Intent Classification ────────────────────────────────────────────────

    let intent = 'unknown';

    // Default transport intents to search. If they select an option later, it will be upgraded to book.
    const transportIntent = 'transport.search';

    // Transport — Train
    if (/\btrain\b|\birctc\b|\bticket\b|\bshatabdi\b|\bvande\b|\brajdhani\b|\bduronto\b/i.test(intentText)) {
      intent = transportIntent;
      constraints.mode = 'train';
    }
    // Transport — Flight
    else if (/\bflight\b|\bplane\b|\bfly\b|\bairport\b|\bairlines\b/i.test(intentText)) {
      intent = transportIntent;
      constraints.mode = 'flight';
    }
    // Transport — Bike/Auto
    else if (/\brapido\b|\bbike\s+taxi\b/i.test(intentText)) {
      intent = transportIntent;
      constraints.mode = 'bike';
    }
    else if (/\bauto\s*rickshaw\b|\bauto\b/i.test(intentText)) {
      intent = transportIntent;
      constraints.mode = 'auto';
    }
    // Transport — Cab (cab/taxi/ride keywords, or explicit provider names)
    else if (/\bcab\b|\btaxi\b|\brid(e|ing)\b|\buber\b|\bola\b|\bblusmart\b|\bcareem\b|\bget\s+me\s+to\b|\bbook\s+a\s+ride\b/i.test(intentText)) {
      intent = transportIntent;
      constraints.mode = 'cab';
    }
    // Transport — Bus
    else if (/\bbus\b|\bredbus\b|\babsbus\b/i.test(intentText)) {
      intent = transportIntent;
      constraints.mode = 'bus';
    }
    // Food
    else if (/\bfood\b|\bhungry\b|\beat\b|\blunch\b|\bdinne?r?\b|\bbreakfast\b|\bsnack\b|\border\s+(food|pizza|biryani|burger)\b/i.test(intentText)) {
      intent = 'food.order';
      if (/\bpizza\b/i.test(intentText))   constraints.cuisine = 'pizza';
      if (/\bbiryani\b/i.test(intentText)) constraints.cuisine = 'biryani';
      if (/\bburger\b/i.test(intentText))  constraints.cuisine = 'burger';
      if (/\blunch\b/i.test(intentText))   constraints.mealType = 'lunch';
      if (/\bdinne?r?\b/i.test(intentText))  constraints.mealType = 'dinner';
      if (/\bbreakfast\b/i.test(intentText)) constraints.mealType = 'breakfast';
    }
    // Grocery
    else if (/\bgrocery\b|\bgroceries\b|\bvegetabl\b|\bmilk\b|\bsabzi\b|\bkirana\b/i.test(intentText)) {
      intent = 'shopping.purchase';
      constraints.category = 'grocery';
    }
    // Shopping (general)
    else if (/\bshop\b|\bbuy\b|\border\b|\bpurchase\b/i.test(intentText)) {
      intent = 'shopping.search';
      // Extract item if possible
      const itemMatch = intentText.match(/(?:buy|order|purchase|shop\s+for)\s+(?:a\s+|an\s+|some\s+)?(.+?)(?:\s+(?:for|from|on|at)\b|$)/i);
      if (itemMatch) constraints.query = itemMatch[1].trim();
    }
    // Healthcare
    else if (/\bdoctor\b|\bappointment\b|\bclinic\b|\bhospital\b|\bsick\b|\bhealth\b|\bmedical\b|\bcardiolog\b|\bdermatolog\b|\borthopedi\b/i.test(intentText)) {
      intent = 'healthcare.search_doctors';
      if (/\bcardiolog/i.test(intentText))  constraints.specialty = 'cardiology';
      if (/\bdermatolog/i.test(intentText)) constraints.specialty = 'dermatology';
      if (/\borthopedi/i.test(intentText))  constraints.specialty = 'orthopedics';
      if (/\bdentist\b/i.test(intentText))  constraints.specialty = 'dentistry';
      if (/\beye\s+doctor|ophthal/i.test(intentText)) constraints.specialty = 'ophthalmology';
    }
    // Jobs
    else if (/\bpost\s+(a\s+)?job\b|\bhire\b|\brecruit\b|\bjob\s+posting\b/i.test(intentText)) {
      intent = 'jobs.post';
      // Extract role if mentioned
      const roleMatch = intentText.match(/(?:hire\s+(?:a\s+)?|post\s+(?:a\s+)?job\s+(?:for\s+)?(?:a\s+)?)([A-Za-z\s]{3,30})(?:\s+(?:developer|engineer|manager|designer|analyst))?/i);
      if (roleMatch) constraints.role = roleMatch[1].trim();
    }
    // Search Jobs
    else if (/\bfind\s+(a\s+)?job\b|\bjob\s+search\b|\blooking\s+for\s+(a\s+)?job\b/i.test(intentText)) {
      intent = 'jobs.search';
      const queryMatch = intentText.match(/(?:as\s+(?:a\s+)?|for\s+(?:a\s+)?)([A-Za-z\s]{3,30})$/i);
      if (queryMatch) constraints.query = queryMatch[1].trim();
    }
    // Invoice / Workflow
    else if (/\binvoice\b.*\bemail\b|\bemail\b.*\binvoice\b/i.test(intentText)) {
      intent = 'workflow.invoice_processing';
      const companyMatch = intentText.match(/(?:from|by|for)\s+([A-Z][a-zA-Z\s&]{2,30})/i);
      if (companyMatch) constraints.company = companyMatch[1].trim();
    }

    // ── Explicit Constraint Extraction (only what is stated) ──────────────────

    // Option ID (e.g., from SelectionWidget)
    const optionMatch = intentText.match(/\[\[OPTION_ID:(.+?)\]\]/);
    if (optionMatch) {
       constraints.optionId = optionMatch[1].trim();
       // Force intent to book if optionId is provided
       if (intent.endsWith('.search')) {
           intent = intent.replace('.search', '.book');
       }
    }

    // "from X to Y" pattern
    const routeMatch = intentText.match(/\bfrom\s+([A-Z][a-zA-Z\s]{1,20})\s+to\s+([A-Z][a-zA-Z\s]{1,20})/i);
    if (routeMatch) {
      constraints.from = routeMatch[1].trim();
      constraints.to   = routeMatch[2].trim();
    } else {
      // Just "to X"
      const toMatch = intentText.match(/\bto\s+([A-Z][a-zA-Z]{2,20})(?:\s+(?:tomorrow|today|tonight|morning|evening|on|at|by|and)\b|\s*$)/i);
      if (toMatch) constraints.to = toMatch[1].trim();
    }

    // Date
    if (/\btomorrow\b/i.test(intentText))     constraints.date = 'tomorrow';
    else if (/\btoday\b/i.test(intentText))   constraints.date = 'today';
    else if (/\bnext\s+week\b/i.test(intentText)) constraints.date = 'next_week';
    else {
      const dayMatch = intentText.match(/\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
      if (dayMatch) constraints.date = dayMatch[1].toLowerCase();
    }

    // Passengers
    const passMatch = intentText.match(/\b(\d+)\s+(?:passenger|person|people|adult|seat)/i);
    if (passMatch) constraints.passengers = parseInt(passMatch[1]);

    return { intent, constraints };
  }
}

const planner = new Planner();
module.exports = { planner, Planner };
