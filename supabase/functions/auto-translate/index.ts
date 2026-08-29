import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  messageId: z.string().uuid().optional(),
  text: z.string().min(1, 'Text required').max(5000, 'Text too long'),
  targetLanguage: z.string().min(2, 'Invalid language code').max(10),
  sourceLanguage: z.string().min(2).max(10).optional()
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
    
    const { messageId, text, targetLanguage, sourceLanguage } = validationResult.data;

    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if translation already exists in cache
    const { data: cachedTranslation } = await supabaseClient
      .from('message_translations')
      .select('translated_text')
      .eq('message_id', messageId)
      .eq('target_language', targetLanguage)
      .maybeSingle();

    if (cachedTranslation) {
      console.log('✅ Using cached translation');
      return new Response(
        JSON.stringify({ translatedText: cachedTranslation.translated_text, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🌐 Auto-translating to ${targetLanguage}:`, text.substring(0, 50));

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash-lite",
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text to ${targetLanguage}. 
          
Rules:
- Detect the source language automatically
- Maintain the original tone and context
- For medical/healthcare terms, use accurate medical terminology
- Return ONLY the translated text, nothing else
- Keep formatting (line breaks, punctuation, emojis) intact
- If already in target language, return the original text`
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

    // Cache the translation
    if (messageId) {
      await supabaseClient
        .from('message_translations')
        .insert({
          message_id: messageId,
          original_language: sourceLanguage || 'auto',
          target_language: targetLanguage,
          translated_text: translatedText
        })
        .then(() => console.log('✅ Translation cached'));
    }

    console.log('✅ Translation complete');

    return new Response(
      JSON.stringify({ translatedText, cached: false }),
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
