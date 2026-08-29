// Visual Search - Upload image and find similar services/products
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { completeChat } from '../_core/aiProvider.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, imageBase64, userId } = await req.json();

    if (!imageUrl && !imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image URL or base64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finalImageUrl = imageUrl || `data:image/jpeg;base64,${imageBase64}`;

    // Step 1: Analyze image using direct multi-provider vision (Gemini / OpenAI)
    let imageAnalysis: any = null;
    let detectedObjects: string[] = [];
    let searchQuery = '';

    try {
      const visionResult = await completeChat({
        primaryProvider: "gemini",
        fallbackProviders: ["openai", "openrouter"],
        model: "gemini-2.5-flash",
        responseFormat: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and provide:
1. Main objects/items visible
2. Category (e.g., food, furniture, appliance, service, etc.)
3. Specific details (brand, type, condition, etc.)
4. Suggested search query to find similar items or services
5. Colors, style, and key features

Respond in JSON format:
{
  "objects": ["object1", "object2"],
  "category": "category",
  "details": "detailed description",
  "search_query": "search query to find similar items",
  "colors": ["color1", "color2"],
  "style": "style description",
  "estimated_value": "price range if applicable"
}`
              },
              {
                type: "image_url",
                image_url: { url: finalImageUrl }
              }
            ]
          }
        ],
      });

      if (visionResult.content) {
        try {
          imageAnalysis = JSON.parse(visionResult.content);
          detectedObjects = imageAnalysis.objects || [];
          searchQuery = imageAnalysis.search_query || imageAnalysis.details || '';
        } catch {
          searchQuery = visionResult.content;
          imageAnalysis = { content: searchQuery };
        }
      }
    } catch (e) {
      console.warn('Vision analysis fallback notice:', e);
    }

    // Step 2: Search for similar services/products based on image analysis
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const searchResults: any[] = [];

    if (searchQuery) {
      const { data: services } = await supabaseClient
        .from('chatr_plus_services')
        .select(`
          *,
          chatr_plus_sellers (
            business_name,
            is_verified,
            phone_number,
            address,
            rating_average
          )
        `)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .eq('is_active', true)
        .limit(10);

      if (services) {
        services.forEach(service => {
          searchResults.push({
            id: service.id,
            title: service.name,
            description: service.description,
            price: `₹${service.price}`,
            image_url: service.image_url,
            rating: service.average_rating,
            source: 'chatr_services',
            type: 'service',
            seller: service.chatr_plus_sellers?.business_name,
            verified: service.chatr_plus_sellers?.is_verified
          });
        });
      }

      // Search in sellers
      const { data: sellers } = await supabaseClient
        .from('chatr_plus_sellers')
        .select('*')
        .or(`business_name.ilike.%${searchQuery}%,business_type.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('is_active', true)
        .limit(5);

      if (sellers) {
        sellers.forEach(seller => {
          searchResults.push({
            id: seller.id,
            title: seller.business_name,
            description: seller.description,
            image_url: seller.logo_url,
            rating: seller.rating_average,
            source: 'sellers',
            type: 'seller',
            verified: seller.is_verified
          });
        });
      }
    }

    // Step 3: Get AI recommendations based on image
    let aiRecommendations = null;
    if (imageAnalysis) {
      try {
        const recResult = await completeChat({
          primaryProvider: "gemini",
          fallbackProviders: ["groq", "openrouter"],
          model: "gemini-2.5-flash",
          messages: [
            {
              role: 'system',
              content: 'You are a visual search assistant. Based on image analysis, suggest relevant services, products, or professionals the user might need.'
            },
            {
              role: 'user',
              content: `Image analysis: ${JSON.stringify(imageAnalysis)}\n\nSuggest 5 relevant services or products the user might be looking for based on this image.`
            }
          ],
          temperature: 0.3,
        });
        aiRecommendations = recResult.content;
      } catch (e) {
        console.warn('AI recommendation fallback notice:', e);
      }
    }

    // Step 4: Store visual search history
    if (userId) {
      await supabaseClient
        .from('visual_search_history')
        .insert({
          user_id: userId,
          image_url: imageUrl || 'uploaded_image',
          image_analysis: imageAnalysis,
          search_query_generated: searchQuery,
          results_found: searchResults.length
        });
    }

    return new Response(
      JSON.stringify({
        image_analysis: imageAnalysis,
        detected_objects: detectedObjects,
        search_query: searchQuery,
        results: searchResults,
        ai_recommendations: aiRecommendations,
        total_results: searchResults.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Visual search error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
