import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateImage } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoUrl, style = 'cartoon' } = await req.json();

    if (!photoUrl) {
      return new Response(
        JSON.stringify({ error: 'Photo URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stylePrompts: Record<string, string> = {
      cartoon: 'Cute cartoon sticker with bold outlines, vibrant colors, clean edges, and transparent background.',
      emoji: 'Emoji-style sticker with simplified features, bright yellow tones, and exaggerated expressions.',
      anime: 'Anime-style sticker with big expressive eyes, smooth shading, and Japanese anime aesthetics.',
      chibi: 'Chibi-style sticker with an oversized head, small body, cute proportions, and adorable expressions.',
      pixel: 'Pixel art sticker with 16-bit style pixels, limited color palette, and retro game aesthetics.',
      sketch: 'Hand-drawn sketch sticker with pencil-like strokes, cross-hatching, and artistic shading.',
    };

    const prompt = `Sticker: ${stylePrompts[style] || stylePrompts.cartoon}`;
    console.log(`Generating ${style} sticker...`);

    const imageResult = await generateImage({
      prompt,
      size: "1024x1024",
      quality: "standard"
    });

    const stickerUrl = imageResult.url || (imageResult.b64_json ? `data:image/png;base64,${imageResult.b64_json}` : null);

    if (!stickerUrl) {
      throw new Error('Failed to generate sticker image');
    }

    console.log('Sticker generated successfully');

    return new Response(
      JSON.stringify({ stickerUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating sticker:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate sticker' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
