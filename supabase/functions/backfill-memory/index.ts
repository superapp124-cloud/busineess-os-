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
    const { batchSize = 100 } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Fetch messages that are not yet in communication_memory
    const { data: messages, error: fetchError } = await supabaseAdmin
      .from('messages')
      .select('id, sender_id, conversation_id, content, created_at')
      .not('content', 'is', null)
      .neq('content', '')
      .limit(batchSize);

    if (fetchError) throw fetchError;

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No messages to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let processedCount = 0;
    
    for (const msg of messages) {
      // Check if it exists in memory already
      const { data: existing } = await supabaseAdmin
        .from('communication_memory')
        .select('id')
        .eq('content', msg.content)
        .single();
        
      if (!existing) {
        // Insert into communication_memory
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('communication_memory')
          .insert({
            user_id: msg.sender_id,
            conversation_id: msg.conversation_id,
            memory_type: 'message',
            content: msg.content,
            metadata: {
              source_message_id: msg.id,
              created_at_original: msg.created_at
            }
          })
          .select('id')
          .single();
          
        if (!insertError && inserted) {
          processedCount++;
          try {
            // Generate strictly 768-dim embedding via text-embedding-004 in CHATR AI Router
            const embeddingResult = await generateEmbedding({
              input: msg.content,
              model: "text-embedding-004",
            });

            await supabaseAdmin
              .from('communication_memory')
              .update({
                embedding: embeddingResult.embedding,
                updated_at: new Date().toISOString()
              })
              .eq('id', inserted.id);
          } catch (embedError) {
            console.error('Failed to generate embedding for backfilled memory item:', embedError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedCount,
      message: `Processed ${processedCount} messages into memory.`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});

  } catch (error: any) {
    console.error("Backfill error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
