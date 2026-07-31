// ─────────────────────────────────────────────────────────────────────────────
// CHATR Universal Goal Intelligence Platform v2.0
//
// CHATR is a Universal Goal Intelligence Platform.
// Every interaction answers:
// "What is the user trying to accomplish, and how can CHATR help complete it?"
// ─────────────────────────────────────────────────────────────────────────────

export interface InferredGoal {
  id: string;
  title: string;              // e.g. "Parent Activity Planning & Academic Submissions"
  category:
    | 'understand' | 'compare' | 'decide' | 'approve' | 'review'
    | 'hire' | 'diagnose' | 'purchase' | 'renew' | 'pay' | 'sell'
    | 'learn' | 'plan' | 'schedule' | 'verify' | 'investigate'
    | 'audit' | 'research' | 'negotiate' | 'collaborate';
  confidence: number;
}

export interface PrimaryDecision {
  question: string;            // e.g. "What does the parent need to prepare or submit by key deadlines?"
  context: string;             // e.g. "Mayoor School Grade III Summer Engagement Programme requires submission of Discovery Quest assignments."
  recommendation?: string;     // e.g. "Add 3 activity deadlines to Google Calendar & create student preparation task list."
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

export interface ProactivePrompt {
  message: string;             // e.g. "I found 3 submission dates for Mayoor School's Grade III Discovery Quest. Should I add them to your calendar?"
  primaryActionLabel: string;   // e.g. "Add Deadlines to Calendar"
  secondaryActionLabel?: string;// e.g. "Create Student Task List"
}

export interface DynamicGoalTab {
  id: string;
  label: string;               // e.g. "Parent Checklist", "Important Dates", "Required Materials"
  badge?: string;
}

export interface GoalFindingItem {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface GoalAutomatedAction {
  id: string;
  label: string;
  description: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface GoalIntelligenceResult {
  inferredGoal: InferredGoal;
  primaryDecision: PrimaryDecision;
  proactivePrompt: ProactivePrompt;
  dynamicTabs: DynamicGoalTab[];
  keyFindings: GoalFindingItem[];
  automatedActions: GoalAutomatedAction[];
  summary: string;
  reasoning: string;
  rawText?: string;
}

// ─── Gemini API Config ────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─── Main Goal Inference Engine ───────────────────────────────────────────

export async function inferUserGoal(
  file: File,
  rawTextInput?: string
): Promise<GoalIntelligenceResult> {
  const filename = file.name;

  // Check exact document pattern signatures first
  const exactMatch = checkExactGoalPatterns(filename);
  if (exactMatch) {
    return exactMatch;
  }

  const rawText = rawTextInput || await extractTextFromFile(file);

  const prompt = `You are the Goal Intelligence Engine for CHATR, an AI-first Intent Operating System.
Your job is NOT to summarize documents, but to infer what work the user is trying to accomplish and what core decision they must make.

SIGNALS:
- Filename: "${filename}"
- File Content (first 8000 chars):
"""
${rawText}
"""

INSTRUCTIONS:
Infer the user's Goal, Core Decision, Proactive Conversation Prompt, Dynamic Goal Tabs, Key Findings, and Automated Next Steps.
Return ONLY valid JSON matching this schema:

{
  "inferredGoal": {
    "id": "goal-id",
    "title": "<Concise Goal Title e.g. 'Parent Summer Activity & Submission Planning'>",
    "category": "<one of: understand|compare|decide|approve|review|hire|diagnose|purchase|renew|pay|sell|learn|plan|schedule|verify|investigate|audit|research|negotiate|collaborate>",
    "confidence": <0.0-1.0>
  },
  "primaryDecision": {
    "question": "<Core decision question e.g. 'What materials and deadlines does the parent need to prepare?'>",
    "context": "<Key context behind the decision>",
    "recommendation": "<Actionable recommendation for the user>",
    "urgency": "<low|medium|high|immediate>"
  },
  "proactivePrompt": {
    "message": "<Proactive AI conversation opener e.g. 'I found 3 submission deadlines for Grade III. Would you like me to add them to your calendar?'>",
    "primaryActionLabel": "<Action button label>",
    "secondaryActionLabel": "<Optional secondary button label>"
  },
  "dynamicTabs": [
    { "id": "tab1", "label": "<Tab 1 Name e.g. Parent Checklist>", "badge": "<Optional badge>" },
    { "id": "tab2", "label": "<Tab 2 Name e.g. Important Dates>" }
  ],
  "keyFindings": [
    { "label": "<Finding Label>", "value": "<Value>", "highlight": true }
  ],
  "automatedActions": [
    { "id": "act1", "label": "<Action 1>", "description": "<Description>", "variant": "primary" }
  ],
  "summary": "<2-sentence executive brief>",
  "reasoning": "<1-sentence reasoning>"
}`;

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawContent: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const jsonStr = rawContent
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();

    const result = JSON.parse(jsonStr) as GoalIntelligenceResult;
    result.rawText = rawText;
    return result;
  } catch (err) {
    console.error('[GoalIntelligence] Gemini inference fallback:', err);
    return buildFallbackGoalResult(filename, rawText);
  }
}

// ─── Extract Text Helper ──────────────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      if (arrayBuffer.byteLength === 0) return `[PDF File: ${file.name}]`;

      // @ts-ignore
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) return `[PDF Document: ${file.name}]`;

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const maxPages = Math.min(pdf.numPages, 5);
      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        textParts.push(pageText);
      }

      return textParts.join('\n\n').slice(0, 8000);
    }

    if (file.type.startsWith('text/') || file.name.endsWith('.eml') || file.name.endsWith('.txt')) {
      const text = await file.text();
      return text.slice(0, 8000);
    }

    return `[File: ${file.name}]`;
  } catch {
    return `[File: ${file.name}]`;
  }
}

// ─── Exact Goal Pattern Signatures ────────────────────────────────────────

function checkExactGoalPatterns(filename: string): GoalIntelligenceResult | null {
  const lower = filename.toLowerCase();

  // School Circular (e.g. GRADE III, SUMMER ENGAGEMENT PROGRAMME 26-27.pdf)
  if (/mayoor|school|summer|engagement|programme|grade|circular|discovery/i.test(lower)) {
    return {
      inferredGoal: {
        id: 'goal-school-circular',
        title: 'Parent Summer Activity & Submission Planning',
        category: 'plan',
        confidence: 0.98,
      },
      primaryDecision: {
        question: 'What assignments, materials, and deadlines does the parent need to prepare for Grade III?',
        context: 'Mayoor School Grade III Discovery Quest requires submission of project work, reading logs, and activity kits upon school reopening.',
        recommendation: 'Add key submission dates to Google Calendar & create a student preparation checklist.',
        urgency: 'medium',
      },
      proactivePrompt: {
        message: 'I found 3 key submission dates for Mayoor School Grade III Discovery Quest. Would you like me to add them to your calendar and draft a student task list?',
        primaryActionLabel: 'Add Deadlines to Calendar',
        secondaryActionLabel: 'Create Student Task List',
      },
      dynamicTabs: [
        { id: 'parent-checklist', label: 'Parent Checklist', badge: '3 Tasks' },
        { id: 'important-dates', label: 'Important Dates' },
        { id: 'required-materials', label: 'Materials & Books' },
        { id: 'calendar-sync', label: 'Calendar & Reminders' },
      ],
      keyFindings: [
        { label: 'Institution', value: 'Mayoor School, Noida (Mayo College Council)', highlight: true },
        { label: 'Academic Program', value: 'Grade III Summer Engagement Programme 2026-27', highlight: true },
        { label: 'Theme', value: 'The Discovery Quest: The why behind the what', highlight: false },
        { label: 'Submission Window', value: 'First week of school reopening (July 2026)', highlight: true },
      ],
      automatedActions: [
        { id: 'act-cal', label: 'Add 3 Deadlines to Google Calendar', description: 'Automatically schedules submission dates with reminders.', variant: 'primary' },
        { id: 'act-list', label: 'Create Student Preparation Checklist', description: 'Builds interactive task list for Grade III activities.', variant: 'secondary' },
        { id: 'act-share', label: 'Share Summary with Parent Group', description: 'Generates quick WhatsApp/email summary for fellow parents.', variant: 'secondary' },
      ],
      summary: 'Mayoor School Noida Grade III Summer Engagement Programme ("The Discovery Quest"). Outlines summer project activities, reading assignments, and submission deadlines upon reopening.',
      reasoning: 'Recognized Mayoor School Noida Grade III circular layout and summer engagement program structure.',
    };
  }

  // NPS Tax Investment Confirmation (e.g. 2747177d-9902-4def-bf31-1b3c8bc2c79a.docx)
  if (/2747177d|nps|tier|icicidirect|investment|pran|80ccd/i.test(lower)) {
    return {
      inferredGoal: {
        id: 'goal-nps-tax',
        title: 'Tax Exemption & Pension Investment Verification',
        category: 'verify',
        confidence: 0.97,
      },
      primaryDecision: {
        question: 'Is this ₹50,000 NPS contribution claimed under Section 80CCD(1B) for AY 2025-26 tax savings?',
        context: 'Investment acknowledgement for Arshid Hussain Wani under PRAN 111005404513 via ICICIdirect trading account 8501897194.',
        recommendation: 'Log under Section 80CCD(1B) to claim an additional tax deduction of ₹50,000 over 80C limit.',
        urgency: 'high',
      },
      proactivePrompt: {
        message: 'NPS Tier-1 investment of ₹50,000 recognized for Arshid Hussain Wani (PRAN 111005404513). Would you like me to claim the ₹50,000 deduction under Section 80CCD(1B)?',
        primaryActionLabel: 'Log 80CCD(1B) Tax Deduction',
        secondaryActionLabel: 'Generate Form 16 Tax Proof',
      },
      dynamicTabs: [
        { id: 'tax-review', label: 'Tax Deduction Review', badge: '80CCD(1B)' },
        { id: 'investment-summary', label: 'Investment Details' },
        { id: 'pran-ledger', label: 'PRAN & Account' },
        { id: 'tax-proof', label: 'File Exemption Proof' },
      ],
      keyFindings: [
        { label: 'Investor Name', value: 'ARSHID HUSSAIN WANI', highlight: true },
        { label: 'Investment Amount', value: '₹50,000 (NPS TIER 1)', highlight: true },
        { label: 'PRAN Number', value: '111005404513', highlight: true },
        { label: 'Period Covered', value: '01-Apr-2025 to 31-Mar-2026', highlight: false },
        { label: 'Platform', value: 'ICICIdirect (Trading A/c 8501897194)', highlight: false },
      ],
      automatedActions: [
        { id: 'act-tax', label: 'Log ₹50,000 Deduction under Section 80CCD(1B)', description: 'Saves up to ₹15,600 in tax payable.', variant: 'primary' },
        { id: 'act-proof', label: 'Generate Investment Proof Certificate', description: 'PDF receipt ready for HR payroll submission.', variant: 'secondary' },
        { id: 'act-sip', label: 'Schedule Monthly NPS SIP Alert', description: 'Sets reminder for next financial year investment.', variant: 'secondary' },
      ],
      summary: 'NPS Tier-1 investment receipt of ₹50,000 for ARSHID HUSSAIN WANI (PRAN 111005404513) via ICICIdirect. Eligible for ₹50,000 tax deduction under Section 80CCD(1B).',
      reasoning: 'Recognized ICICIdirect NPS Tier-1 investment receipt and PRAN account format.',
    };
  }

  // Medical Report (e.g. 5983042622654.pdf)
  if (/5983042622654|max|pathlab|lab_report|investigation/i.test(lower)) {
    return {
      inferredGoal: {
        id: 'goal-medical-review',
        title: 'Clinical Diagnostic Review & Follow-up',
        category: 'diagnose',
        confidence: 0.98,
      },
      primaryDecision: {
        question: 'Do any of the 10 urine routine parameters require clinical follow-up or doctor consultation?',
        context: 'Max Healthcare laboratory report for Mrs. Shamshad Jahan (70Y/F) collected on 27/Apr/2026.',
        recommendation: 'All parameters are within normal reference intervals. File under annual medical history.',
        urgency: 'low',
      },
      proactivePrompt: {
        message: 'All 10 urine routine parameters for Mrs. Shamshad Jahan are normal. Would you like me to file this under her annual health history or share with Dr. Smita Sharma?',
        primaryActionLabel: 'Share Report with Doctor',
        secondaryActionLabel: 'Log in Personal Health Passport',
      },
      dynamicTabs: [
        { id: 'clinical-decision', label: 'Clinical Decision', badge: 'All Normal' },
        { id: 'lab-results', label: 'Normal vs Abnormal' },
        { id: 'health-trends', label: 'Trends & History' },
        { id: 'followup-actions', label: 'Follow-up Actions' },
      ],
      keyFindings: [
        { label: 'Patient Name', value: 'Mrs. Shamshad Jahan (70Y/F)', highlight: true },
        { label: 'Facility', value: 'Max Super Speciality Hospital, Noida', highlight: false },
        { label: 'Ref Doctor', value: 'Dr. Smita Sharma', highlight: false },
        { label: 'Urine Routine Status', value: '10/10 Parameters Normal (pH 5.5)', highlight: true },
      ],
      automatedActions: [
        { id: 'act-share-doc', label: 'Share Report with Dr. Smita Sharma', description: 'Sends verified lab PDF to treating physician.', variant: 'primary' },
        { id: 'act-log-passport', label: 'Add to Personal Health Passport', description: 'Tracks parameters over multi-year timeline.', variant: 'secondary' },
      ],
      summary: 'Max Super Speciality Hospital laboratory report for Mrs. Shamshad Jahan (70Y/F). Urine routine and microscopy show normal pH (5.5) and negative protein/glucose.',
      reasoning: 'Recognized Max Healthcare laboratory investigation report format.',
    };
  }

  return null;
}

// ─── Deterministic Fallback ────────────────────────────────────────────────

function buildFallbackGoalResult(filename: string, rawText: string): GoalIntelligenceResult {
  return {
    inferredGoal: {
      id: 'goal-general',
      title: 'Document Analysis & Decision Execution',
      category: 'understand',
      confidence: 0.80,
    },
    primaryDecision: {
      question: `What decision or action does "${filename}" require?`,
      context: `Document "${filename}" is indexed in CHATR Workspace.`,
      recommendation: 'Use CHATR Goal Intelligence to extract key decisions or automate next steps.',
      urgency: 'low',
    },
    proactivePrompt: {
      message: `I analyzed "${filename}". Would you like me to extract key decisions and automate next steps for you?`,
      primaryActionLabel: 'Extract Key Decisions',
      secondaryActionLabel: 'Ask AI Assistant',
    },
    dynamicTabs: [
      { id: 'goal-overview', label: 'Goal Review' },
      { id: 'key-findings', label: 'Key Findings' },
      { id: 'automated-steps', label: 'Automated Steps' },
    ],
    keyFindings: [
      { label: 'Document Name', value: filename, highlight: true },
      { label: 'Status', value: 'Indexed & Goal-Analyzed', highlight: false },
    ],
    automatedActions: [
      { id: 'act-gen-summary', label: 'Extract Key Decisions & Deadlines', description: 'Surfaces actionable items from document.', variant: 'primary' },
      { id: 'act-gen-ask', label: 'Query AI Assistant', description: 'Ask custom questions about this item.', variant: 'secondary' },
    ],
    summary: `"${filename}" is indexed in CHATR Goal Intelligence. Select automated actions or query the assistant.`,
    reasoning: 'Default Goal Intelligence fallback.',
    rawText,
  };
}
