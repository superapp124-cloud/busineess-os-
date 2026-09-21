import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat, AIMessage } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lastMessage, message, context = [], replyCount = 3, tone, action } = await req.json();
    const userMessage = message || lastMessage;

    if (!userMessage && !action) {
      return new Response(
        JSON.stringify({ error: 'Message or lastMessage required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle chat mode (direct AI conversation)
    if (message && !action) {
      const messages: AIMessage[] = [];

      // Add context as conversation history
      if (context && (typeof context === 'string' ? context.length > 0 : Array.isArray(context) && context.length > 0)) {
        const contextArray = typeof context === 'string' ? context.split('\n') : context;
        contextArray.forEach((msg: string) => {
          if (!msg || msg.trim() === '') return;
          const [role, ...contentParts] = msg.split(': ');
          messages.push({
            role: role.toLowerCase() === 'user' ? 'user' : 'assistant',
            content: contentParts.join(': ') || msg
          });
        });
      }

      // Add current user message
      messages.push({ role: 'user', content: userMessage });

      const chatResult = await completeChat({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Provide clear, concise, and friendly responses. Keep answers under 200 words unless specifically asked for more detail.'
          },
          ...messages
        ]
      });

      return new Response(
        JSON.stringify({ reply: chatResult.content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different AI actions
    if (action === 'improve_tone') {
      const tonePrompts = {
        polite: 'Rewrite this message to be more polite and courteous',
        casual: 'Rewrite this message to be more casual and friendly',
        professional: 'Rewrite this message to be more professional and formal',
        friendly: 'Rewrite this message to be warmer and more friendly'
      };

      const promptDirective = tonePrompts[tone as keyof typeof tonePrompts] || tonePrompts.friendly;

      const chatResult = await completeChat({
        messages: [
          {
            role: 'system',
            content: `${promptDirective}. Return only the improved message without explanations.`
          },
          { role: 'user', content: userMessage }
        ]
      });

      return new Response(
        JSON.stringify({ improvedText: chatResult.content?.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate smart replies (default path)
    const contextStr = Array.isArray(context) && context.length > 0
      ? `\n\nRecent conversation:\n${context.join('\n')}`
      : typeof context === 'string' && context.trim().length > 0
      ? `\n\nRecent conversation:\n${context}`
      : '';

    const chatResult = await completeChat({
      messages: [
        {
          role: 'system',
          content: `You are a WhatsApp-style smart reply assistant. Generate ${replyCount} quick, natural reply suggestions to the user's last message. Each reply should be:
- Short (max 10 words)
- Natural and conversational
- Varied in tone (casual, friendly, professional)
- Contextually appropriate

Return ONLY a JSON array of replies with this exact format:
[
  {"text": "reply 1", "tone": "casual"},
  {"text": "reply 2", "tone": "friendly"},
  {"text": "reply 3", "tone": "professional"}
]

Do not include any other text or formatting.`
        },
        { role: 'user', content: `Last message: "${userMessage}"${contextStr}` }
      ],
      responseFormat: { type: "json_object" }
    });

    const content = chatResult.content || '';

    // Try to parse JSON response
    let replies = [];
    try {
      const cleanJson = content.replace(/^```json\s*|```$/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      replies = Array.isArray(parsed) ? parsed : parsed.replies || [];
    } catch (e) {
      // Fallback: extract replies from text
      console.log('Fallback parsing for replies');
      replies = [
        { text: 'Thanks!', tone: 'casual' },
        { text: 'Sounds good 👍', tone: 'friendly' },
        { text: 'Understood', tone: 'professional' }
      ];
    }

    return new Response(
      JSON.stringify({ replies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('AI smart reply error:', error);
    const status = error instanceof PlatformError ? error.status : 500;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
