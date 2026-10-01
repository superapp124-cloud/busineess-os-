/**
 * gsc-sync — Google Search Console Sync Edge Function
 *
 * CHATR Business OS · chatrchat.in
 *
 * Actions:
 *   sync               — Pull GSC Search Analytics data into gsc_queries table
 *   evaluate_opportunities — Recalculate opportunity scores (also runs after sync)
 *   metrics            — Return aggregated GSC metrics for the admin dashboard
 *
 * Authentication: Google Service Account (preferred) or OAuth2 refresh token.
 * All credentials are stored in Supabase Vault secrets — NEVER in browser.
 *
 * Property: sc-domain:chatrchat.in
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROPERTY_ID = "sc-domain:chatrchat.in";
const DISPLAY_NAME = "chatrchat.in (Domain Property)";
const ROW_LIMIT = 25000;
const STABILIZATION_DAYS = 3;
const LOOKBACK_DAYS = 28;

// ── GSC API helpers ─────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const serviceEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const rawKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");

  if (serviceEmail && rawKey) {
    const privateKey = rawKey.replace(/\\n/g, "\n");
    return getServiceAccountToken(serviceEmail, privateKey);
  }

  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN");

  if (clientId && clientSecret && refreshToken) {
    return refreshOAuthToken(clientId, clientSecret, refreshToken);
  }

  throw new Error(
    "[gsc-sync] No Google credentials configured. " +
    "Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY " +
    "or GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET + GOOGLE_OAUTH_REFRESH_TOKEN in Supabase Vault."
  );
}

async function getServiceAccountToken(email: string, privateKey: string): Promise<string> {
  const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
  const now = Math.floor(Date.now() / 1000);

  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const payload = btoa(JSON.stringify({
    iss: email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const signingInput = `${header}.${payload}`;

  // Import the private key for signing
  const pemKey = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemKey), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const jwt = `${signingInput}.${signatureB64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const err = await tokenResponse.text();
    throw new Error(`[gsc-sync] Service account token exchange failed: ${err}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function refreshOAuthToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`[gsc-sync] OAuth token refresh failed: ${err}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchGSCRows(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[]
): Promise<any[]> {
  const allRows: any[] = [];
  let startRow = 0;

  while (true) {
    const encodedSite = encodeURIComponent(siteUrl);
    const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: ROW_LIMIT,
        startRow,
        dataState: "final",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`GSC API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const rows = data.rows ?? [];
    allRows.push(...rows);

    if (rows.length < ROW_LIMIT) break;
    startRow += ROW_LIMIT;
  }

  return allRows;
}

// ── Date helpers ─────────────────────────────────────────────────────────────

function getDateRange() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - STABILIZATION_DAYS);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - LOOKBACK_DAYS);
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "sync";

    // ── ACTION: metrics — return live dashboard data ──────────────────────
    if (action === "metrics") {
      const { data: queries, error: qErr } = await supabase
        .from("gsc_queries")
        .select("clicks, impressions, position, ctr")
        .eq("property_id", PROPERTY_ID);

      if (qErr) {
        return new Response(JSON.stringify({ error: qErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const rows = queries ?? [];
      const totalClicks = rows.reduce((s: number, r: any) => s + (r.clicks ?? 0), 0);
      const totalImpressions = rows.reduce((s: number, r: any) => s + (r.impressions ?? 0), 0);
      const avgPosition = rows.length > 0
        ? rows.reduce((s: number, r: any) => s + (r.position ?? 0), 0) / rows.length
        : 0;
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      // Top queries by clicks
      const sorted = [...rows]
        .sort((a: any, b: any) => (b.clicks ?? 0) - (a.clicks ?? 0))
        .slice(0, 10);

      const { count: oppCount } = await supabase
        .from("gsc_opportunities")
        .select("*", { count: "exact", head: true })
        .eq("property_id", PROPERTY_ID);

      return new Response(JSON.stringify({
        success: true,
        propertyId: PROPERTY_ID,
        totalClicks,
        totalImpressions,
        avgPosition: Math.round(avgPosition * 10) / 10,
        avgCTR: Math.round(avgCTR * 100) / 100,
        totalQueries: rows.length,
        totalOpportunities: oppCount ?? 0,
        topQueries: sorted,
        lastUpdated: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: sync — pull GSC Search Analytics data ────────────────────
    const syncStartedAt = new Date().toISOString();
    const runId = `gsc_sync_${Date.now()}`;
    const errors: string[] = [];
    let rowsUpserted = 0;

    // Ensure property record exists
    await supabase.from("gsc_properties").upsert({
      property_id: PROPERTY_ID,
      display_name: DISPLAY_NAME,
      auth_status: "CONNECTED",
      updated_at: syncStartedAt,
    }, { onConflict: "property_id" });

    // Get access token
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (authErr: any) {
      console.error("[gsc-sync] Auth failed:", authErr.message);
      return new Response(JSON.stringify({
        success: false,
        error: authErr.message,
        hint: "Configure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in Supabase Vault secrets.",
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { startDate, endDate } = getDateRange();

    // Dimension sets to pull
    const dimensionSets = [
      { dimensions: ["query", "page"], label: "query_page" },
      { dimensions: ["query", "country"], label: "query_country" },
      { dimensions: ["query", "device"], label: "query_device" },
    ];

    for (const { dimensions, label } of dimensionSets) {
      try {
        const rows = await fetchGSCRows(accessToken, PROPERTY_ID, startDate, endDate, dimensions);

        for (const row of rows) {
          const query = row.keys[0] ?? "";
          const page = dimensions.includes("page") ? (row.keys[dimensions.indexOf("page")] ?? "") : "";
          const country = dimensions.includes("country") ? (row.keys[dimensions.indexOf("country")] ?? "unknown") : "unknown";
          const device = dimensions.includes("device") ? (row.keys[dimensions.indexOf("device")] ?? "ALL") : "ALL";

          if (!query.trim()) continue;

          const { error: upsertErr } = await supabase.from("gsc_queries").upsert({
            property_id: PROPERTY_ID,
            sync_date: endDate,          // required NOT NULL — use end of sync window
            query,
            page,
            country,
            device,
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
            data_source: "gsc_api",
            synced_at: syncStartedAt,
          }, {
            onConflict: "property_id,query,country,device",
            ignoreDuplicates: false,
          });

          if (upsertErr) {
            errors.push(`[${label}] upsert error for '${query}': ${upsertErr.message}`);
          } else {
            rowsUpserted++;
          }
        }

        console.log(`[gsc-sync] ${label}: fetched ${rows.length} rows`);
      } catch (dimErr: any) {
        errors.push(`[${label}] fetch error: ${dimErr.message}`);
        console.error(`[gsc-sync] ${label} error:`, dimErr.message);
      }
    }

    // Recalculate opportunity scores
    if (action === "sync" || action === "evaluate_opportunities") {
      const { error: rpcError } = await supabase.rpc("calculate_gsc_opportunities", {
        p_property_id: PROPERTY_ID,
      });
      if (rpcError) {
        console.error("[gsc-sync] calculate_gsc_opportunities RPC error:", rpcError.message);
      }
    }

    const { count: oppCount } = await supabase
      .from("gsc_opportunities")
      .select("*", { count: "exact", head: true })
      .eq("property_id", PROPERTY_ID);

    // Log the sync run (best-effort, non-blocking)
    try {
      await supabase.from("cc_logs").insert({
        agent: "gsc_sync",
        action: `GSC sync complete: ${rowsUpserted} rows upserted, ${errors.length} errors`,
        level: errors.length > 0 ? "warn" : "info",
        details: { runId, rowsUpserted, errors: errors.slice(0, 10), propertyId: PROPERTY_ID },
      });
    } catch (_logErr) { /* non-fatal */ }

    return new Response(JSON.stringify({
      success: true,
      runId,
      propertyId: PROPERTY_ID,
      rowsUpserted,
      totalOpportunities: oppCount ?? 0,
      errors: errors.slice(0, 20),
      syncedRange: { startDate, endDate },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[gsc-sync] Fatal error:", err.message);
    return new Response(JSON.stringify({
      error: err.message || "Unknown error during GSC sync",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
