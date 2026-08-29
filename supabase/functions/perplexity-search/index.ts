import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { completeChat } from "../_core/aiProvider.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  query: string;
  maxResults?: number;
  latitude?: number | null;
  longitude?: number | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults = 10, latitude, longitude }: SearchParams = await req.json();
    console.log('Perplexity-style search request:', { query, maxResults, hasLocation: !!(latitude && longitude) });

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a location-dependent query
    const isLocationQuery = query.toLowerCase().includes('near') || 
                            query.toLowerCase().includes('nearby') || 
                            query.toLowerCase().includes('local') ||
                            query.toLowerCase().includes('around me');
    
    if (isLocationQuery && (!latitude || !longitude)) {
      console.error('Location-dependent query without coordinates:', query);
      return new Response(
        JSON.stringify({ 
          error: 'LOCATION_REQUIRED',
          message: 'This search requires your location. Please enable location services.',
          success: false
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Scrape DuckDuckGo for real web results (fast)
    console.log('Fetching DuckDuckGo results...');
    const duckResults = await searchDuckDuckGo(query, maxResults);
    console.log(`Got ${duckResults.length} DuckDuckGo results`);

    // Step 2: Generate AI summary using Direct AI Router (Gemini / Groq)
    console.log('Generating AI summary...');
    const aiSummary = await generateAISummary(query, duckResults);
    console.log('AI summary generated');

    return new Response(
      JSON.stringify({
        success: true,
        query,
        aiSummary,
        results: duckResults,
        sources: duckResults.map(r => ({ title: r.title, url: r.url })),
        hasLocation: !!(latitude && longitude),
        location: latitude && longitude ? { latitude, longitude } : null,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Perplexity search error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function searchDuckDuckGo(query: string, maxResults: number) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const data = await response.json();
    const results: any[] = [];

    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        snippet: data.AbstractText,
        url: data.AbstractURL || `https://duckduckgo.com/?q=${encodedQuery}`,
        source: 'instant_answer'
      });
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics.slice(0, maxResults - results.length)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 100),
            snippet: topic.Text,
            url: topic.FirstURL,
            source: 'related_topic'
          });
        }
      }
    }

    if (results.length === 0) {
      const htmlResults = await scrapeDuckDuckGoHTML(query, maxResults);
      results.push(...htmlResults);
    }

    return results.slice(0, maxResults);
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

async function scrapeDuckDuckGoHTML(query: string, maxResults: number) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo HTML error: ${response.status}`);
    }

    const html = await response.text();
    const results: any[] = [];
    const resultRegex = /<a class="result__snippet[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const titleRegex = /<a class="result__url[^>]*>([\s\S]*?)<\/a>/gi;
    
    let match;
    let count = 0;
    while ((match = resultRegex.exec(html)) !== null && count < maxResults) {
      const url = match[1];
      const snippet = match[2].replace(/<[^>]*>/g, '').trim();
      
      results.push({
        title: query,
        snippet: snippet,
        url: url.startsWith('//') ? `https:${url}` : url,
        source: 'web'
      });
      count++;
    }

    return results;
  } catch (error) {
    console.error('HTML scraping error:', error);
    return [];
  }
}

async function generateAISummary(query: string, searchResults: any[]) {
  try {
    const context = searchResults
      .slice(0, 5)
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nSource: ${r.url}`)
      .join('\n\n');

    const prompt = `You are an expert research assistant. Based on the following search results for the query "${query}", provide a comprehensive, accurate summary that:

1. Directly answers the user's query in 2-3 paragraphs
2. Synthesizes information from multiple sources
3. Includes specific facts, numbers, and details
4. Uses natural, conversational language
5. Cites sources using [1], [2], etc. notation

Search Results:
${context}

Provide a detailed, informative summary:`;

    const response = await completeChat({
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
      model: "gemini-2.5-flash",
      messages: [
        { 
          role: 'system', 
          content: 'You are a research assistant that provides accurate, comprehensive summaries based on search results. Always cite sources using [number] notation.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      maxTokens: 800,
    });

    return response.content || 'No summary available.';
  } catch (error) {
    console.error('AI summary generation error:', error);
    return `Based on the search results, here's what we found about "${query}". The search returned ${searchResults.length} relevant results with detailed information.`;
  }
}
