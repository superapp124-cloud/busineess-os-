import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  recentMessages: z.array(z.object({
    sender: z.string().max(100),
    content: z.string().max(5000)
  })).min(1, 'At least one message required').max(10),
  context: z.string().max(200).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = inputSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { recentMessages, context } = validationResult.data;

    if (!recentMessages || recentMessages.length === 0) {
      throw new Error('No conversation context provided');
    }

    // Build conversation history for context
    const conversationContext = recentMessages
      .slice(-5)
      .map((msg: any) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    console.log('Generating smart replies for context:', conversationContext);

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash-lite",
      messages: [
        {
          role: 'system',
          content: `You are a smart reply assistant for a messaging app. Generate 3 SHORT, natural, contextually appropriate reply suggestions based on the conversation. 
          
Rules:
- Keep replies under 10 words each
- Make them conversational and natural
- Match the tone of the conversation
- Include variety: casual, friendly, and appropriate options
- Return ONLY a JSON array of 3 strings, nothing else`
        },
        {
          role: 'user',
          content: `Recent conversation:\n${conversationContext}\n\nContext: ${context || 'general chat'}\n\nGenerate 3 smart reply suggestions.`
        }
      ],
      temperature: 0.8,
      maxTokens: 150
    });

    const aiResponse = response.content;
    console.log('AI response:', aiResponse);

    // Parse JSON array from response
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (e) {
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        suggestions = JSON.parse(match[0]);
      } else {
        suggestions = ["Sounds good!", "Thanks for letting me know.", "I'll check on this."];
      }
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Smart compose error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
