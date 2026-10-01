/**
 * CHATR SI OS — Communication OS Intelligence
 * src/ai/communication/CommunicationIntelligence.ts
 *
 * Makes communication an active source of personal intelligence:
 * 1. Scheduling Extraction ("Let's sync next Tuesday around 3 PM" -> Calendar proposal)
 * 2. Commitment Detection ("I'll send over the report by 6 PM today" -> Reminder proposal)
 * 3. Voice Message Intelligence (Synthesizes long audio into a 45-sec executive summary, decisions, and action items)
 */

export interface SchedulingProposal {
  detected: boolean;
  meetingTitle: string;
  proposedTime: string;
  participant?: string;
  rawPhrase: string;
  confidence: number;
  actionProposal?: {
    actionId: string;
    type: 'CALENDAR_EVENT_PROPOSAL';
    title: string;
    dateTime: string;
    riskLevel: 'LEVEL_2_REVERSIBLE';
  };
}

export interface CommitmentProposal {
  detected: boolean;
  commitmentText: string;
  dueTime: string;
  assignee: string;
  rawPhrase: string;
  confidence: number;
  reminderProposal?: {
    actionId: string;
    type: 'TASK_REMINDER_PROPOSAL';
    title: string;
    dueTime: string;
    riskLevel: 'LEVEL_2_REVERSIBLE';
  };
}

export interface VoiceNoteSummary {
  originalLengthSeconds: number;
  estimatedReadingSeconds: number;
  timeSavedSeconds: number;
  executiveSummary: string; // Compact readable summary (< 200 chars, readable in < 45 seconds)
  decisions: string[];
  actionItems: string[];
}

export class CommunicationIntelligence {
  private static instance: CommunicationIntelligence;

  private constructor() {}

  public static getInstance(): CommunicationIntelligence {
    if (!CommunicationIntelligence.instance) {
      CommunicationIntelligence.instance = new CommunicationIntelligence();
    }
    return CommunicationIntelligence.instance;
  }

  /**
   * 1. Scheduling Intent Extraction
   * Detects scheduling proposals in chat and voice transcripts.
   */
  public extractSchedulingIntents(text: string): SchedulingProposal {
    const cleanText = text.trim();

    // Regex patterns for meeting intents
    // Supports:
    // - "Let's sync next Tuesday around 3 PM"
    // - "Let's meet Rahul tomorrow at 4 PM"
    // - "Can we connect with Sarah on Friday at 10 AM"
    const scheduleRegex = /(?:let's|can we|shall we|let us|could we)?\s*(?:sync|meet|catch up|connect|call|have a meeting)(?:\s+(?:with\s+)?([A-Z][a-z]+))?\s+(?:on\s+)?(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)(?:\s+(?:at|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?/i;

    const match = cleanText.match(scheduleRegex);

    if (match) {
      const participant = match[1] || undefined;
      const day = match[2];
      const time = match[3] || 'TBD';
      const proposedTime = `${day.charAt(0).toUpperCase() + day.slice(1)} at ${time}`;

      // Extract title intent
      let meetingTitle = participant ? `Meeting with ${participant}` : 'Sync Meeting';
      if (/catch up/i.test(cleanText)) meetingTitle = participant ? `Catch up with ${participant}` : 'Catch up';
      else if (/call/i.test(cleanText)) meetingTitle = participant ? `Call with ${participant}` : 'Call';
      else if (/strategy/i.test(cleanText)) meetingTitle = 'Strategy Sync';

      return {
        detected: true,
        meetingTitle,
        proposedTime,
        participant,
        rawPhrase: match[0],
        confidence: 0.92,
        actionProposal: {
          actionId: `sched_act_${Date.now()}`,
          type: 'CALENDAR_EVENT_PROPOSAL',
          title: meetingTitle,
          dateTime: proposedTime,
          riskLevel: 'LEVEL_2_REVERSIBLE',
        },
      };
    }

    return {
      detected: false,
      meetingTitle: '',
      proposedTime: '',
      rawPhrase: '',
      confidence: 0,
    };
  }

  /**
   * 2. Commitment & Promise Extraction
   * Detects commitments made in conversation (e.g. "I'll send over the report by 6 PM today")
   */
  public extractCommitments(text: string, speaker: string = 'me'): CommitmentProposal {
    const cleanText = text.trim();

    // Patterns like: "I'll send over the report by 6 PM today", "I will deliver the slides tomorrow"
    const commitmentRegex = /(?:i'll|i will|promise to|i can|will)\s+([a-zA-Z\s]+?)\s+(?:by|before|at)\s+([a-zA-Z0-9:\s]+?)(?:\.|$)/i;

    const match = cleanText.match(commitmentRegex);

    if (match) {
      const task = match[1].trim();
      const deadline = match[2].trim();

      return {
        detected: true,
        commitmentText: task,
        dueTime: deadline,
        assignee: speaker,
        rawPhrase: match[0].trim(),
        confidence: 0.88,
        reminderProposal: {
          actionId: `rem_act_${Date.now()}`,
          type: 'TASK_REMINDER_PROPOSAL',
          title: `${task.charAt(0).toUpperCase() + task.slice(1)}`,
          dueTime: deadline,
          riskLevel: 'LEVEL_2_REVERSIBLE',
        },
      };
    }

    return {
      detected: false,
      commitmentText: '',
      dueTime: '',
      assignee: speaker,
      rawPhrase: '',
      confidence: 0,
    };
  }

  /**
   * 3. Voice Message Intelligence
   * Synthesizes long audio transcriptions into an executive summary, decisions, and action items.
   */
  public summarizeVoiceNote(transcription: string, durationSeconds: number = 240): VoiceNoteSummary {
    const sentences = transcription
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Extract decisions
    const decisions: string[] = [];
    const actionItems: string[] = [];

    for (const s of sentences) {
      if (/we decided|agreed to|agreed that|agreed on|the decision is|let's go with|approved/i.test(s)) {
        decisions.push(s.replace(/^(first,\s*|second,\s*|we decided to|agreed to|agreed that|so we decided)\s*/i, '').trim());
      }
      if (/i will|you should|please|action item|task is to|need to/i.test(s)) {
        actionItems.push(s.replace(/^(please|action item:|we need to)\s*/i, '').trim());
      }
    }

    // Default synthesis if no explicit markers
    if (decisions.length === 0 && sentences.length > 0) {
      decisions.push(sentences[0]);
    }
    if (actionItems.length === 0 && sentences.length > 1) {
      actionItems.push(sentences[sentences.length - 1]);
    }

    // Executive summary guaranteed < 200 characters for quick reading under 45 seconds
    const firstSentence = sentences[0] || 'Voice memo received.';
    const secondSentence = sentences[1] ? ` ${sentences[1]}` : '';
    let executiveSummary = `${firstSentence}${secondSentence}`;
    if (executiveSummary.length > 180) {
      executiveSummary = executiveSummary.slice(0, 177) + '...';
    }

    const estimatedReadingSeconds = Math.max(5, Math.ceil(transcription.split(/\s+/).length / 4)); // ~240 wpm
    const timeSavedSeconds = Math.max(0, durationSeconds - estimatedReadingSeconds);

    return {
      originalLengthSeconds: durationSeconds,
      estimatedReadingSeconds,
      timeSavedSeconds,
      executiveSummary,
      decisions: decisions.slice(0, 3),
      actionItems: actionItems.slice(0, 3),
    };
  }
}

export const communicationIntelligence = CommunicationIntelligence.getInstance();
