import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Layer 1: Fast Heuristics
function runHeuristics(content: string) {
  const hasLink = /(https?:\/\/[^\s]+)/g.test(content);
  const hasFinancial = /\b(bank|crypto|bitcoin|eth|transfer|wire|western union|gift card|otp|password|verify)\b/i.test(content);
  const isUrgent = /\b(urgent|immediate|account suspended|locked|warning|final notice)\b/i.test(content);
  
  let score = 0;
  if (hasLink) score += 20;
  if (hasFinancial) score += 20;
  if (isUrgent) score += 20;
  
  return {
    needsDeepScan: score >= 20 || hasLink,
    baseScore: score,
    findings: { hasLink, hasFinancial, isUrgent }
  };
}

// Layer 3: AI Risk Classifier (Direct Multi-Provider Router)
async function analyzeThreatWithAI(content: string) {
  const systemPrompt = `You are CHATR Shield, an advanced active threat detection AI. 
Analyze the following message for scams, phishing, malware links, or fraud.
Return a strict JSON object with this exact schema:
{
  "overall_score": number (0-100, where 100 is most dangerous),
  "overall_level": string ("safe", "suspicious", "dangerous"),
  "detections": {
    "phishing": number (0-100),
    "spam": number (0-100),
    "malware": number (0-100),
    "fraud": number (0-100)
  },
  "explanation": string[] (Array of concise, user-friendly bullet points explaining why it's dangerous. Max 3 bullets. Empty array if safe.),
  "recommended_action": string ("None", "Do not click links", "Block sender", "Ignore")
}`;

  const response = await completeChat({
    primaryProvider: "gemini",
    fallbackProviders: ["openrouter", "groq", "openai"],
    model: "gemini-2.5-flash",
    responseFormat: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Message to analyze: "${content}"` },
    ],
    temperature: 0.1,
  });

  try {
    return JSON.parse(response.content);
  } catch (e) {
    console.error("Failed to parse AI response:", response.content);
    throw new Error("Invalid AI response format");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record || payload; 
    
    if (!record.content || !record.id) {
      return new Response(JSON.stringify({ error: "Missing content or message id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Layer 1 & 2: Heuristics & Reputation
    const heuristics = runHeuristics(record.content);
    
    if (!heuristics.needsDeepScan) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "Passed fast heuristics" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Layer 3: Deep AI Scan
    const aiResult = await analyzeThreatWithAI(record.content);

    if (aiResult.overall_score >= 40) {
      const { error: insertError } = await supabaseAdmin
        .from('message_security_scans')
        .insert({
          message_id: record.id,
          overall_score: aiResult.overall_score,
          overall_level: aiResult.overall_level,
          detections: aiResult.detections,
          explanation: aiResult.explanation,
          recommended_action: aiResult.recommended_action
        });

      if (insertError) {
        console.error("DB Insert Error:", insertError);
        throw insertError;
      }
    }

    return new Response(JSON.stringify({ success: true, scan: aiResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Shield pipeline error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
