import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { completeChat } from "../_core/aiProvider.ts";
import { PlatformError } from "../_core/errors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, featureName, type } = await req.json();

    if (!prompt || !featureName) {
      return new Response(
        JSON.stringify({ error: 'prompt and featureName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating feature:', { featureName, type });

    // Generate React Component, Database Schema, and API/Helper Functions in parallel via CHATR AI Router
    const [componentRes, schemaRes, apiRes] = await Promise.all([
      completeChat({
        messages: [
          {
            role: 'system',
            content: `You are an expert React/TypeScript developer. Generate production-ready code for a React component using:
- TypeScript
- shadcn/ui components
- Tailwind CSS
- React hooks
- Supabase client for data fetching
Only return the component code, no explanations.`
          },
          {
            role: 'user',
            content: `Create a React component for: ${featureName}\n\nRequirements:\n${prompt}\n\nInclude all necessary imports and make it production-ready.`
          }
        ],
        temperature: 0.7,
        maxTokens: 2000,
      }),
      completeChat({
        messages: [
          {
            role: 'system',
            content: `You are a database expert. Generate SQL schema for Supabase (PostgreSQL) including:
- Table creation
- Row Level Security (RLS) policies
- Indexes
- Triggers if needed
Only return SQL code, no explanations.`
          },
          {
            role: 'user',
            content: `Create database schema for: ${featureName}\n\nRequirements:\n${prompt}\n\nInclude RLS policies for security.`
          }
        ],
        temperature: 0.7,
        maxTokens: 1500,
      }),
      completeChat({
        messages: [
          {
            role: 'system',
            content: `You are an expert in building APIs and helper functions. Generate TypeScript functions for:
- API calls using Supabase client
- Data transformation utilities
- Custom hooks if needed
Only return code, no explanations.`
          },
          {
            role: 'user',
            content: `Create API functions for: ${featureName}\n\nRequirements:\n${prompt}\n\nUse Supabase client for all data operations.`
          }
        ],
        temperature: 0.7,
        maxTokens: 1500,
      })
    ]);

    const component = componentRes.content || '';
    const schema = schemaRes.content || '';
    const api = apiRes.content || '';

    return new Response(
      JSON.stringify({
        component,
        schema,
        api,
        featureName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-feature function:', error);
    const status = error instanceof PlatformError ? error.status : 500;
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error occurred' }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
