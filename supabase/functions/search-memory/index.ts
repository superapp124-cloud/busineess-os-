import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { generateEmbedding, completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Synthesize answer using direct AI Router (Gemini / OpenRouter / Groq)
async function synthesizeAnswer(query: string, memories: any[]): Promise<string> {
  const contextText = memories.map((m, i) => `[Source ${i+1} - ${m.memory_type}]: ${m.content}`).join('\n\n');

  const systemPrompt = `You are the Brain of the CHATR Communication OS. 
Answer the user's query based ONLY on the provided memory context.
If the memory context does not contain the answer, say you don't know based on their history.
Always cite your sources using the format [Source X].`;

  const response = await completeChat({
    primaryProvider: "gemini",
    fallbackProviders: ["openrouter", "groq", "openai"],
    model: "gemini-2.5-flash",
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${contextText}\n\nQuery: ${query}` }
    ],
    temperature: 0.2
  });

  return response.content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, filter_type } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    // Auth validation
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Generate query embedding (768 dimensions)
    const embeddingResult = await generateEmbedding({
      input: query,
      model: "text-embedding-004",
    });

    // 2. Perform hybrid search via RPC
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: memories, error: searchError } = await supabaseAdmin.rpc('hybrid_search_memory', {
      query_embedding: embeddingResult.embedding,
      match_threshold: 0.1,
      match_count: 10,
      p_user_id: user.id,
      filter_type: filter_type || null
    });

    if (searchError) throw searchError;

    if (!memories || memories.length === 0) {
      return new Response(JSON.stringify({ 
        answer: "I couldn't find anything related to that in your communication memory.",
        sources: []
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    // 3. Synthesize the answer
    const answer = await synthesizeAnswer(query, memories);

    return new Response(JSON.stringify({ 
      answer,
      sources: memories.map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        content: m.content,
        similarity: m.similarity,
        memory_type: m.memory_type
      }))
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});

  } catch (error: any) {
    console.error("Search memory error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
