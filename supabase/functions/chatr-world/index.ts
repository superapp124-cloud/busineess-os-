import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map cities to include nearby metros for better results
const NEARBY_CITIES: Record<string, string[]> = {
  'noida': ['noida', 'delhi', 'gurgaon', 'gurugram', 'ghaziabad', 'ncr'],
  'gurgaon': ['gurgaon', 'gurugram', 'delhi', 'noida', 'ncr'],
  'gurugram': ['gurgaon', 'gurugram', 'delhi', 'noida', 'ncr'],
  'ghaziabad': ['ghaziabad', 'delhi', 'noida', 'ncr'],
  'faridabad': ['faridabad', 'delhi', 'noida', 'ncr'],
  'thane': ['thane', 'mumbai', 'navi mumbai'],
  'navi mumbai': ['navi mumbai', 'mumbai', 'thane'],
  'howrah': ['howrah', 'kolkata'],
};

function getSearchCities(city: string | undefined): string[] {
  if (!city) return [];
  const lower = city.toLowerCase();
  return NEARBY_CITIES[lower] || [lower];
}

// Simple intent detection without AI
function detectIntent(query: string): { modules: string[]; primary_intent: string; search_terms: string[]; location_needed: boolean } {
  const q = query.toLowerCase();
  const modules: string[] = [];
  
  if (q.includes('food') || q.includes('restaurant') || q.includes('eat') || q.includes('pizza') || q.includes('burger') || q.includes('biryani') || q.includes('cafe') || q.includes('affordable') || q.includes('cheap')) {
    modules.push('food');
  }
  if (q.includes('doctor') || q.includes('hospital') || q.includes('health') || q.includes('clinic') || q.includes('medical')) {
    modules.push('health');
  }
  if (q.includes('job') || q.includes('work') || q.includes('hiring') || q.includes('career') || q.includes('service')) {
    modules.push('business');
  }
  if (q.includes('deal') || q.includes('discount') || q.includes('offer') || q.includes('coupon') || q.includes('sale')) {
    modules.push('deals');
  }
  if (q.includes('clean') || q.includes('plumber') || q.includes('electrician') || q.includes('repair') || q.includes('home service')) {
    modules.push('business');
  }
  
  if (modules.length === 0) {
    modules.push('browser', 'food');
  }
  
  return {
    modules,
    primary_intent: query,
    search_terms: query.split(' ').filter(w => w.length > 2),
    location_needed: q.includes('near') || q.includes('nearby') || q.includes('local')
  };
}

// Direct AI call
async function callDirectAI(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash",
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      maxTokens: 500,
    });
    return response.content || '';
  } catch (err) {
    console.error('Direct AI error:', err);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, latitude, longitude, city, country } = await req.json();
    
    console.log('Received request:', { query, userId, city, country });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use simple intent detection
    const analysis = detectIntent(query);
    console.log('Intent analysis:', analysis);

    // Get search cities (includes nearby metros)
    const searchCities = getSearchCities(city);
    console.log('Search cities:', searchCities);

    // Fetch data from modules
    const results: any = { modules: analysis.modules, intent: analysis.primary_intent, data: {} };
    const fetchPromises = [];

    if (analysis.modules.includes('browser')) {
      results.data.browser = { type: 'web_results', query, suggestion: `Searching for "${query}"` };
    }

    if (analysis.modules.includes('business')) {
      fetchPromises.push(
        (async () => {
          let jobQuery = supabase.from('chatr_jobs').select('*').eq('is_active', true);
          if (searchCities.length > 0) {
            const cityFilters = searchCities.map(c => `location.ilike.%${c}%`).join(',');
            jobQuery = jobQuery.or(cityFilters);
          }
          const { data } = await jobQuery.limit(10);
          results.data.business = {
            type: 'jobs',
            providers: (data || []).map(j => ({
              id: j.id, name: j.title, description: `${j.company_name}`, location: j.location
            })),
            count: data?.length || 0
          };
        })()
      );
    }

    if (analysis.modules.includes('health')) {
      fetchPromises.push(
        (async () => {
          let healthQuery = supabase.from('chatr_healthcare').select('*').eq('is_active', true);
          if (searchCities.length > 0) {
            const cityFilters = searchCities.map(c => `city.ilike.%${c}%`).join(',');
            healthQuery = healthQuery.or(cityFilters);
          }
          const { data } = await healthQuery.limit(10);
          results.data.health = {
            type: 'healthcare',
            providers: (data || []).map(h => ({
              id: h.id, name: h.name, specialty: h.specialty, location: h.city, fee: h.consultation_fee
            })),
            count: data?.length || 0
          };
        })()
      );
    }

    if (analysis.modules.includes('food')) {
      fetchPromises.push(
        (async () => {
          let foodQuery = supabase.from('chatr_restaurants').select('*').eq('is_active', true);
          if (searchCities.length > 0) {
            const cityFilters = searchCities.map(c => `city.ilike.%${c}%`).join(',');
            foodQuery = foodQuery.or(cityFilters);
          }
          const { data } = await foodQuery.limit(10);
          results.data.food = {
            type: 'restaurants',
            vendors: (data || []).map(r => ({
              id: r.id, name: r.name, cuisine: r.cuisine_type, location: r.city, rating: r.rating_average
            })),
            count: data?.length || 0
          };
        })()
      );
    }

    if (analysis.modules.includes('deals')) {
      fetchPromises.push(
        (async () => {
          let dealsQuery = supabase.from('chatr_deals').select('*').eq('is_active', true).gte('expires_at', new Date().toISOString());
          if (searchCities.length > 0) {
            const cityFilters = searchCities.map(c => `location.ilike.%${c}%`).join(',');
            dealsQuery = dealsQuery.or(cityFilters);
          }
          const { data } = await dealsQuery.limit(10);
          results.data.deals = {
            type: 'deals',
            deals: (data || []).map(d => ({
              id: d.id, name: d.title, discount: `${d.discount_percent}% OFF`, code: d.coupon_code
            })),
            count: data?.length || 0
          };
        })()
      );
    }

    await Promise.all(fetchPromises);

    const systemPrompt = `You are Chatr World assistant.
Help users find services, food, deals and healthcare.
Give short helpful answers with specific names and details.
Use plain text, no markdown formatting.
Be friendly and conversational.
Always mention how to order or book if relevant.`;

    const userPrompt = `Location: ${city || 'Unknown'}, ${country || 'Unknown'}
Query: ${query}
Available data: ${JSON.stringify(results.data)}
Give a helpful response about what is available.`;

    let conversationalText = await callDirectAI(systemPrompt, userPrompt);
    
    // Fallback response if AI fails
    if (!conversationalText) {
      const dataCount = Object.values(results.data).reduce((sum: number, d: any) => sum + (d.count || d.vendors?.length || d.providers?.length || 0), 0);
      if (dataCount > 0) {
        conversationalText = `I found ${dataCount} results for "${query}" in ${city || 'your area'}. Check the results below to see what's available. You can tap on any item for more details.`;
      } else {
        conversationalText = `I searched for "${query}" but couldn't find exact matches in ${city || 'your area'}. Try broadening your search or check nearby areas.`;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        query,
        analysis,
        response: conversationalText,
        modules: results.data,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Chatr World error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
