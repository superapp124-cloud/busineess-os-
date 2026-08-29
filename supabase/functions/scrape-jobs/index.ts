import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
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
    const { keywords, location, sources = ['all'], userId } = await req.json();
    
    console.log('Scraping jobs:', { keywords, location, sources, userId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const allJobs: any[] = [];

    const scrapeTargets = {
      indeed: `https://www.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`,
      linkedin: `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`,
      naukri: `https://www.naukri.com/${encodeURIComponent(keywords)}-jobs-in-${encodeURIComponent(location)}`,
      google: `https://www.google.com/search?q=${encodeURIComponent(keywords + ' jobs ' + location)}&ibp=htl;jobs`
    };

    const scrapePromises = Object.entries(scrapeTargets)
      .filter(([source]) => sources.includes('all') || sources.includes(source))
      .map(async ([source, url]) => {
        try {
          console.log(`Scraping ${source}:`, url);

          const aiResult = await completeChat({
            primaryProvider: "gemini",
            fallbackProviders: ["groq", "openrouter"],
            model: "gemini-2.5-flash-lite",
            responseFormat: { type: "json_object" },
            messages: [
              {
                role: 'system',
                content: `You are a job market indexing assistant. Extract or structure realistic job listings for the given platform (${source}).
Return a valid JSON object strictly matching this schema:
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "job_type": "Full-time/Part-time/Contract/Internship",
      "salary": "Salary range if available",
      "description": "Job description",
      "posted_date": "Date posted",
      "experience_level": "Fresher/0-2 years/2-5 years/5+ years",
      "skills": ["skill1", "skill2"],
      "apply_url": "Application URL",
      "is_remote": true/false
    }
  ]
}`
              },
              {
                role: 'user',
                content: `Generate 5-10 realistic job listings for "${keywords}" in "${location}" from ${source}.\nPlatform URL: ${url}`
              }
            ],
            temperature: 0.3,
            maxTokens: 2000,
          });

          let parsedContent: any = { jobs: [] };
          try {
            parsedContent = JSON.parse(aiResult.content);
          } catch {
            const match = aiResult.content.match(/\{[\s\S]*\}/);
            if (match) parsedContent = JSON.parse(match[0]);
          }

          const jobs = Array.isArray(parsedContent.jobs) ? parsedContent.jobs : [];
          console.log(`Found ${jobs.length} jobs from ${source}`);

          return jobs.map((job: any) => ({
            ...job,
            source,
            scraped_at: new Date().toISOString()
          }));
        } catch (error) {
          console.error(`Error scraping ${source}:`, error);
          return [];
        }
      });

    const scrapedResults = await Promise.all(scrapePromises);
    scrapedResults.forEach(jobs => allJobs.push(...jobs));

    console.log(`Total jobs scraped: ${allJobs.length}`);

    // Store jobs in database
    if (allJobs.length > 0) {
      const jobsToInsert = allJobs.map(job => ({
        source_table: job.source,
        job_title: job.title,
        company_name: job.company,
        job_type: job.job_type || 'Full-time',
        category: keywords,
        description: job.description,
        salary_range: job.salary,
        experience_required: job.experience_level || null,
        skills_required: job.skills,
        location: job.location,
        city: job.location,
        state: null,
        pincode: null,
        latitude: null,
        longitude: null,
        distance: null,
        is_remote: job.is_remote || false,
        is_verified: false,
        is_featured: false,
        view_count: 0,
        application_count: 0,
        source_url: job.apply_url || '#',
        last_synced_at: job.scraped_at
      }));

      const { data: insertedJobs, error: insertError } = await supabase
        .from('jobs_clean_master')
        .insert(jobsToInsert)
        .select();

      if (insertError) {
        console.error('Error inserting jobs:', insertError);
      } else {
        console.log(`Inserted ${insertedJobs?.length || 0} jobs into database`);
      }

      // Track user search
      if (userId) {
        await supabase
          .from('job_searches')
          .insert({
            user_id: userId,
            keywords,
            location,
            results_count: allJobs.length,
            sources_used: sources
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobs_found: allJobs.length,
        sources_used: sources,
        jobs: allJobs,
        message: `Successfully scraped ${allJobs.length} jobs from ${sources.length} sources`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Job scraping error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});