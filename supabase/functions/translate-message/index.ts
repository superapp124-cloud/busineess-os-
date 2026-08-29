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
  text: z.string().min(1, 'Text required').max(5000, 'Text too long'),
  targetLanguage: z.string().min(2, 'Invalid language code').max(10)
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
    
    const { text, targetLanguage } = validationResult.data;

    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    console.log(`Translating to ${targetLanguage}:`, text);

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash-lite",
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text to ${targetLanguage}.
          
Translation rules:
- Maintain the original tone and context
- For medical or healthcare terms, use accurate medical terminology
- Sound natural in the target language, like a native speaker wrote it
- NO markdown formatting or asterisks in the translation
- Return ONLY the translated text, nothing else
- Keep formatting (line breaks, punctuation) intact`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      maxTokens: 500
    });

    const translatedText = response.content.trim();
    console.log('Translation result:', translatedText);

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
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
