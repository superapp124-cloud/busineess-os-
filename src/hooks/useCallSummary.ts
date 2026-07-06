import { useState } from 'react';
import { generate } from '@/services/ai';

interface UseCallSummaryArgs {
  meetingTitle: string;
  transcript: string;
}

function buildSummaryPrompt(meetingTitle: string, transcript: string): string {
  return `You are a professional AI assistant. 
Your exact task is to summarize the meeting transcript provided below.

### MEETING TOPIC
${meetingTitle}

### TRANSCRIPT
${transcript || '(no transcript captured)'}

### INSTRUCTIONS
1. Write a concise 3-sentence summary of the transcript.
2. Below the summary, provide a "Next Steps" bulleted list of action items.
Do not apologize, do not say "Here is the summary", just output the summary directly.`;
}

/**
 * Call generateSummary() when the call ends (e.g. Leave button handler).
 * Uses the same generate() entry point. In strict privacy mode this is local Ollama only.
 */
export function useCallSummary({ meetingTitle, transcript }: UseCallSummaryArgs) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateSummary(overrideTranscript?: string) {
    const finalTranscript = overrideTranscript !== undefined ? overrideTranscript : transcript;
    if (!finalTranscript.trim()) return;
    setLoading(true);
    try {
      const prompt = buildSummaryPrompt(meetingTitle, finalTranscript);
      const raw = await generate({ prompt, preferLocal: true });
      setSummary(raw);
    } catch (err: any) {
      console.error('[useCallSummary] generation failed', err);
      // Show the user-friendly message directly (ai.ts now formats these well)
      setSummary(`❌ AI generation failed.\n\n${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return { summary, loading, generateSummary };
}
