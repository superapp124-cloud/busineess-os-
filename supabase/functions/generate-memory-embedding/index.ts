import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { generateEmbedding } from "../_core/aiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    // We expect this to be called either directly or via a Postgres Webhook
    const record = payload.record || payload; 
    
    if (!record.content || !record.id) {
      return new Response(JSON.stringify({ error: "Missing content or id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate 768-dim embedding via direct Gemini text-embedding-004 / OpenRouter fallback
    console.log(`Generating embedding for memory id: ${record.id}`);
    const embeddingResult = await generateEmbedding({
      input: record.content,
      model: "text-embedding-004",
    });

    const isOTP = /\b\d{4,6}\b/.test(record.content) && /code|otp|verify/i.test(record.content);
    const hasMoney = /\$|₹|€/.test(record.content);
    const importance = isOTP ? 0.2 : (hasMoney ? 0.9 : 0.5);

    const metadata = {
      ...record.metadata,
      importance,
      auto_tagged: true,
      tags: hasMoney ? ['finance'] : (isOTP ? ['otp'] : [])
    };

    // Update the record with the embedding and metadata
    const { error: updateError } = await supabase
      .from('communication_memory')
      .update({ 
        embedding: embeddingResult.embedding,
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', record.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, id: record.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error processing memory embedding:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
