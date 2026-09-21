import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const inputSchema = z.object({
  message: z.string().min(1, 'Message required').max(5000, 'Message too long'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(5000)
  })).max(50).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  city: z.string().nullable().optional()
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
    
    const { message, history, latitude, longitude, city } = validationResult.data;
    
    // Check if this is a location-dependent query
    const isLocationQuery = message.toLowerCase().includes('near') || 
                            message.toLowerCase().includes('nearby') || 
                            message.toLowerCase().includes('local') ||
                            message.toLowerCase().includes('around me') ||
                            message.toLowerCase().includes('close to me');
    
    if (isLocationQuery && (!latitude || !longitude)) {
      console.warn('Location-dependent health query without coordinates:', message);
      // Don't block, but log and inform in response
    }
    
    const messages = [
      {
        role: 'system' as const,
        content: `You are a helpful health assistant. Provide general health information and guidance in a clear, human tone.
        ${city ? `\nUser is currently in: ${city}. When recommending healthcare providers or services, mention they can find nearby options using the Healthcare or Chatr World features.` : ''}
        
        Communication style:
        - Write like a knowledgeable person, not a robot
        - NO markdown formatting (no asterisks, bold, or code-like text)
        - NO phrases like "As an AI" or robotic disclaimers
        - Use natural transitions like "Overall," "In summary," "Here's what I'd suggest"
        - Keep it professional yet conversational
        
        Important rules:
        - Always remind users to consult healthcare professionals for medical advice
        - Be empathetic, clear, and concise
        - If symptoms are serious, urgently recommend seeing a doctor
        - Suggest specific specialists when relevant (general practitioner, cardiologist, etc.)
        - Prioritize clarity over formality`
      },
      ...(history || []),
      { role: 'user' as const, content: message }
    ];

    const chatResult = await completeChat({
      messages,
      temperature: 0.7,
      maxTokens: 500,
    });

    const assistantMessage = chatResult.content || '';

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-health-assistant:', error);
    const status = error instanceof PlatformError ? error.status : 500;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
