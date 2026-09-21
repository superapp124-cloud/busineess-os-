import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  sourceLang?: string;
  targetLang: string;
  callId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLang = 'auto', targetLang, callId }: TranslateRequest = await req.json();

    console.log('[live-translate] Request:', { textLength: text?.length, sourceLang, targetLang });

    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Text and target language required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let translatedText = text;
    let detectedLanguage = sourceLang;

    const languageMap: Record<string, string> = {
      en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German',
      zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic', pt: 'Portuguese',
      ru: 'Russian', it: 'Italian', nl: 'Dutch', tr: 'Turkish', pl: 'Polish',
      ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
    };

    const targetLangName = languageMap[targetLang] || targetLang;

    try {
      const chatResult = await completeChat({
        messages: [
          {
            role: 'system',
            content: `You are a live translation engine. Translate the following text to ${targetLangName}. 
${sourceLang === 'auto' ? 'First detect the source language.' : `Source language: ${languageMap[sourceLang] || sourceLang}`}

Return a JSON object with:
- translatedText: the translated text
- detectedLanguage: ISO 639-1 code of detected source language (e.g., "en", "hi")

Text to translate:
"${text}"

Return ONLY valid JSON, no markdown or explanation.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.2,
        maxTokens: 1024,
        responseFormat: { type: "json_object" }
      });

      const responseText = chatResult.content || '';
      try {
        const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        translatedText = parsed.translatedText || text;
        detectedLanguage = parsed.detectedLanguage || sourceLang;
        console.log('[live-translate] Translation complete:', { from: detectedLanguage, to: targetLang });
      } catch (parseError) {
        translatedText = responseText.trim();
        console.log('[live-translate] Used raw response as translation');
      }
    } catch (routerError) {
      console.warn('[live-translate] AI router failed, keeping original text:', routerError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        originalText: text,
        translatedText,
        sourceLang: detectedLanguage,
        targetLang,
        callId,
        translatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[live-translate] Error:', error);
    const status = error instanceof PlatformError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
