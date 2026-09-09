import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cf-connecting-ip",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Establish trusted client identity from Edge / CDN headers
    // Priority: CF-Connecting-IP (Cloudflare) > x-real-ip > fallback
    const trustedIp = req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const body = await req.json().catch(() => ({}));
    const { action, destinationHash } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing required action parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Resolve authenticated user if present
    let authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const clientIdentifier = userId ? `uid:${userId}` : `ip:${trustedIp}`;

    // 3. Call server-authoritative enforcement RPC
    const { data, error } = await supabase.rpc("enforce_server_abuse_limit", {
      p_action: action,
      p_client_identifier: clientIdentifier,
      p_destination_hash: destinationHash || null,
    });

    if (error) {
      console.error("[abuse-guard] RPC error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          allowed: false,
          reason: data.reason || "Rate limit exceeded. Please try again later.",
          retryAfterSec: data.retry_after_seconds || 300,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(data.retry_after_seconds || 300),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        allowed: true,
        currentCount: data.current_count,
        limit: data.limit,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[abuse-guard] Internal error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
