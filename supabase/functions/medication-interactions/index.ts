import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { medications } = await req.json();

    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return new Response(
        JSON.stringify({ interactions: [], message: 'Need at least 2 medications to check interactions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use direct AI router to check for medication interactions
    const aiResult = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash",
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You are a pharmaceutical AI expert. Analyze medication combinations for potential interactions.
For each pair of medications, determine:
1. Interaction severity (minor, moderate, severe)
2. Description of the interaction
3. Clinical recommendations
Return JSON: {interactions: [{med1, med2, severity, description, recommendation}]}`
        },
        {
          role: 'user',
          content: `Analyze interactions between these medications: ${medications.join(', ')}`
        }
      ],
      temperature: 0.3,
      maxTokens: 1500
    });

    const aiContent = aiResult.content || '{}';
    
    let interactions;
    try {
      interactions = JSON.parse(aiContent).interactions || [];
    } catch {
      const match = aiContent.match(/\{[\s\S]*\}/);
      interactions = match ? (JSON.parse(match[0]).interactions || []) : [];
    }

    // Check database for known interactions
    const { data: knownInteractions } = await supabase
      .from('medication_interactions')
      .select('*')
      .or(medications.map(med => `medication_1.ilike.%${med}%,medication_2.ilike.%${med}%`).join(','));

    const allInteractions = [
      ...(knownInteractions || []),
      ...interactions
    ];

    // Store new interactions found by AI
    for (const interaction of interactions) {
      if (interaction.med1 && interaction.med2) {
        await supabase
          .from('medication_interactions')
          .upsert({
            medication_1: interaction.med1,
            medication_2: interaction.med2,
            interaction_severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation
          }, { onConflict: 'medication_1,medication_2' });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        interactions: allInteractions,
        warning: allInteractions.some((i: any) => i.severity === 'severe' || i.interaction_severity === 'severe')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Medication interactions error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});