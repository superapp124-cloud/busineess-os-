// Search suggestions edge function using direct AI provider

import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let userQuery = '';
  try {
    const { query, recentSearches = [] } = await req.json();
    userQuery = query || '';

    // Generate AI-powered search suggestions via direct fast model (Groq / Gemini)
    const aiResult = await completeChat({
      primaryProvider: "groq",
      fallbackProviders: ["gemini", "openrouter"],
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: 'system',
          content: `You are a search suggestion assistant for Chatr.chat.
Given a partial search query, suggest 5 relevant completions that users might be searching for.
Focus on local services in India: plumbers, electricians, food delivery, healthcare, jobs, beauty services, etc.

Respond ONLY with a JSON array of strings (no markdown, no explanations):
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]

Examples:
Query: "plumb" → ["plumber near me", "plumbing services", "emergency plumber", "plumber in Noida", "24/7 plumber"]
Query: "doc" → ["doctor consultation", "doctor near me", "dentist appointment", "doctor on call", "eye doctor"]
Query: "bir" → ["biryani delivery", "biryani near me", "chicken biryani", "veg biryani", "biryani restaurant"]`
        },
        {
          role: 'user',
          content: `Partial query: "${userQuery}"\nRecent searches: ${recentSearches.slice(0, 3).join(', ')}`
        }
      ],
      temperature: 0.5,
      maxTokens: 200,
    });

    let suggestions: string[] = [];

    try {
      const content = aiResult.content || '[]';
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      suggestions = JSON.parse(cleanContent);
    } catch {
      suggestions = getDefaultSuggestions(userQuery);
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search suggestions notice:', error);
    return new Response(
      JSON.stringify({ suggestions: getDefaultSuggestions(userQuery) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultSuggestions(query: string): string[] {
  const q = (query || '').toLowerCase();
  
  if (q.includes('plumb')) return ['plumber near me', 'plumbing services', 'emergency plumber', '24/7 plumber', 'plumber in Noida'];
  if (q.includes('doc') || q.includes('dr')) return ['doctor consultation', 'doctor near me', 'dentist appointment', 'doctor on call', 'eye doctor'];
  if (q.includes('bir')) return ['biryani delivery', 'biryani near me', 'chicken biryani', 'veg biryani', 'biryani restaurant'];
  if (q.includes('food') || q.includes('rest')) return ['food delivery', 'restaurants near me', 'fast food', 'home food', 'food order online'];
  if (q.includes('elec')) return ['electrician near me', 'electrical services', 'emergency electrician', '24/7 electrician'];
  if (q.includes('clean')) return ['cleaning services', 'house cleaning', 'deep cleaning', 'office cleaning'];
  
  return [
    `${query || 'local'} near me`,
    `${query || 'local'} services`,
    `best ${query || 'services'}`,
    `${query || 'food'} delivery`,
    `${query || 'stores'} online`
  ];
}