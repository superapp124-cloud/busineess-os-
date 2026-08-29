import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, summaryType } = await req.json();
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    // Prepare conversation text
    const conversationText = messages
      .map((m: any) => `${m.sender_name}: ${m.content}`)
      .join('\n');

    let systemPrompt = '';
    const baseRules = `
    
Writing style:
- Write in a clear, human tone as if a person wrote this summary
- NO markdown formatting (no asterisks, bold, or code-like text)
- NO robotic phrases like "As an AI" or "The conversation shows"
- Use natural transitions like "Overall," "In summary," "Here's what happened"
- Keep it professional yet conversational
- Prioritize clarity over formality`;

    if (summaryType === 'brief') {
      systemPrompt = `Summarize this conversation in 2-3 sentences, highlighting key points.${baseRules}`;
    } else if (summaryType === 'detailed') {
      systemPrompt = `Provide a detailed summary of this conversation including main topics discussed, decisions made, and action items. Use short paragraphs for readability.${baseRules}`;
    } else if (summaryType === 'action_items') {
      systemPrompt = `Extract all action items, tasks, and to-dos from this conversation. Use simple bullet points (use • not asterisks). Keep each item clear and actionable.${baseRules}`;
    } else if (summaryType === 'meeting_notes') {
      systemPrompt = `Create meeting notes from this conversation. Include: Topics Discussed, Decisions Made, Action Items, and Next Steps. Use clear headings and bullet points (• not asterisks) where helpful.${baseRules}`;
    } else {
      systemPrompt = `Summarize this conversation concisely.${baseRules}`;
    }

    console.log('Generating summary for', messages.length, 'messages');

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash-lite",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: conversationText }
      ],
      temperature: 0.3,
      maxTokens: 1000,
    });

    const summary = response.content || 'Unable to generate summary';
    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-chat-summary:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
