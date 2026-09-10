import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const propertyId = "sc-domain:chatrchat.in";

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync";

    // 1. Ensure property record exists in gsc_properties
    await supabase.from("gsc_properties").upsert({
      property_id: propertyId,
      display_name: "chatrchat.in (Domain Property)",
      auth_status: "CONNECTED",
      updated_at: new Date().toISOString()
    }, { onConflict: "property_id" });

    // 2. If action is evaluate_opportunities, run calculate_gsc_opportunities RPC
    if (action === "evaluate_opportunities" || action === "sync") {
      const { data: count, error: rpcError } = await supabase.rpc("calculate_gsc_opportunities", {
        p_property_id: propertyId
      });

      if (rpcError) {
        console.error("calculate_gsc_opportunities RPC error:", rpcError);
      }

      // Check current opportunity counts
      const { count: oppCount } = await supabase
        .from("gsc_opportunities")
        .select("*", { count: "exact", head: true })
        .eq("property_id", propertyId);

      return new Response(JSON.stringify({
        success: true,
        propertyId,
        opportunitiesCalculated: count || 0,
        totalOpportunities: oppCount || 0,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Action completed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      error: err.message || "Unknown error during GSC sync"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
