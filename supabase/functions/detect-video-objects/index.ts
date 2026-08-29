import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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
    const { imageData, sessionId } = await req.json();

    const aiResult = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["openrouter", "openai"],
      model: "gemini-2.5-flash",
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an object detection expert. Detect common brandable objects in images: cups, mugs, phones, tablets, laptops, t-shirts, hats, bottles, cans, bags, watches, headphones, backgrounds. Return only JSON."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Detect all brandable objects in this image. Return as JSON array with: {\"objects\": [{\"type\": \"object_type\", \"confidence\": 0.0-1.0, \"position\": {\"x\": 0-100, \"y\": 0-100}, \"size\": {\"width\": 0-100, \"height\": 0-100}}]}"
            },
            {
              type: "image_url",
              image_url: { url: imageData }
            }
          ]
        }
      ],
    });

    let detection: { objects: any[] } = { objects: [] };
    try {
      detection = JSON.parse(aiResult.content);
    } catch {
      const match = aiResult.content.match(/\{[\s\S]*\}/);
      if (match) detection = JSON.parse(match[0]);
    }

    // Get brand placements for detected objects
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const brandedObjects = [];

    for (const obj of detection.objects || []) {
      const { data: brandData } = await supabase.rpc('get_brand_for_object', {
        p_object_type: obj.type
      });

      if (brandData && brandData.length > 0) {
        const brand = brandData[0];
        brandedObjects.push({
          ...obj,
          brand: {
            brand_id: brand.brand_id,
            brand_name: brand.brand_name,
            placement_id: brand.placement_id,
            replacement_asset_url: brand.replacement_asset_url,
            replacement_type: brand.replacement_type
          }
        });

        // Track impression (view)
        await supabase.rpc('track_brand_impression', {
          p_brand_id: brand.brand_id,
          p_placement_id: brand.placement_id,
          p_user_id: null,
          p_impression_type: 'view',
          p_detected_object: obj.type,
          p_duration: 0
        });
      }
    }

    return new Response(JSON.stringify({ 
      objects: brandedObjects,
      sessionId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in detect-video-objects:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      objects: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
