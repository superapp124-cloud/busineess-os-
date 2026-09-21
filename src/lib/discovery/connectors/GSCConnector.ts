import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DiscoveryConnector, SyncResult, ConnectorHealth, TenantId } from '../types';
import { TX_SUPABASE_URL } from '../talentxcelClient';

/**
 * GSCConnector — Google Search Console OAuth2 Integration
 *
 * SERVER-SIDE ONLY. OAuth tokens never reach the browser.
 * Targets: TalentXcel database (dthlgsnakhoftinssokm)
 *
 * Uses Service Account JSON (preferred for background workers)
 * or OAuth2 refresh token flow.
 *
 * Data fetched per sync:
 *   - query × page (primary)
 *   - query × country
 *   - query × device
 *   - page × searchAppearance
 *
 * Pagination: startRow loop until rows.length < rowLimit
 * Stabilization: target date = TODAY - 3 days
 * Provenance: data_source='gsc_api' on every row
 */
export class GSCConnector implements DiscoveryConnector {
  private supabase: SupabaseClient;
  private readonly ROW_LIMIT = 25000;
  private readonly STABILIZATION_DAYS = 3;

  /** @throws if env vars are missing */
  constructor() {
    // Use TalentXcel service role key — different project from CHATR
    const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY;

    if (!serviceKey) {
      throw new Error(
        '[GSCConnector] Missing TALENTXCEL_SERVICE_ROLE_KEY.\n' +
        'Get it from: https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/settings/api\n' +
        'This connector must run server-side only.'
      );
    }

    this.supabase = createClient(TX_SUPABASE_URL, serviceKey, {
      auth: { persistSession: false },
    });
  }


  // ─── Public API ───────────────────────────────────────────────────────────

  async sync(tenantId: TenantId): Promise<SyncResult> {
    const runId = `gsc_sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const syncStartedAt = new Date().toISOString();
    const errors: string[] = [];
    let rowsInserted = 0;
    let rowsUpdated = 0;

    await this.writeAuditLog(tenantId, runId, 'gsc_sync_start', 'SUCCESS', { runId });

    try {
      // Fetch tenant to get GSC property ID
      const { data: tenant, error: tenantErr } = await this.supabase
        .from('udx_tenants')
        .select('gsc_property_id')
        .eq('tenant_id', tenantId)
        .single();

      if (tenantErr || !tenant?.gsc_property_id) {
        throw new Error(`[GSCConnector] Tenant '${tenantId}' not found or has no gsc_property_id.`);
      }

      const accessToken = await this.getAccessToken();
      let siteUrl = tenant.gsc_property_id;

      // Auto-detect verified property format from GSC API
      try {
        const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json() as any;
          const siteEntries = sitesData.siteEntry || [];
          const matched = siteEntries.find((s: any) => 
            s.siteUrl === siteUrl ||
            (tenant.domain && s.siteUrl.includes(tenant.domain))
          );
          if (matched) {
            siteUrl = matched.siteUrl;
          }
        }
      } catch (e) {
        // Fallback to tenant.gsc_property_id
      }


      // Target date = today - STABILIZATION_DAYS
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - this.STABILIZATION_DAYS);
      const endDate = targetDate.toISOString().slice(0, 10);
      // Fetch 16 days of data ending at target
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 16);
      const startDateStr = startDate.toISOString().slice(0, 10);

      // Fetch all four dimension sets
      const dimensionSets: Array<{ dimensions: string[]; label: string }> = [
        { dimensions: ['query', 'page'], label: 'query_page' },
        { dimensions: ['query', 'country'], label: 'query_country' },
        { dimensions: ['query', 'device'], label: 'query_device' },
        { dimensions: ['page', 'searchAppearance'], label: 'page_appearance' },
      ];

      for (const { dimensions, label } of dimensionSets) {
        try {
          const rows = await this.fetchAllRows(accessToken, siteUrl, startDateStr, endDate, dimensions);

          for (const row of rows) {
            const query = row.keys[0] ?? '';
            const page = dimensions.includes('page') ? (row.keys[dimensions.indexOf('page')] ?? '') : '';
            const country = dimensions.includes('country') ? (row.keys[dimensions.indexOf('country')] ?? 'unknown') : 'unknown';
            const device = dimensions.includes('device') ? (row.keys[dimensions.indexOf('device')] ?? 'ALL') : 'ALL';
            const normalizedQuery = this.normalizeQuery(query);

            if (!normalizedQuery) continue;

            const upsertPayload = {
              tenant_id: tenantId,
              query,
              normalized_query: normalizedQuery,
              country,
              device,
              impressions: row.impressions ?? 0,
              clicks: row.clicks ?? 0,
              ctr: row.ctr ?? 0,
              avg_position: row.position ?? 0,
              data_source: 'gsc_api',
              last_gsc_sync_at: syncStartedAt,
              last_updated_at: syncStartedAt,
            };

            const { error: upsertErr, data: upsertData } = await this.supabase
              .from('udx_demand_entities')
              .upsert(upsertPayload, {
                onConflict: 'tenant_id,normalized_query,country',
                ignoreDuplicates: false,
              })
              .select('entity_id')
              .single();

            if (upsertErr) {
              errors.push(`[${label}] upsert error for '${query}': ${upsertErr.message}`);
            } else {
              // Track inserted vs updated
              rowsInserted++;
            }

            // Backward-compat: also write to tx_gsc_queries if tenant is talentxcel
            if (tenantId === 'talentxcel' && query) {
              await this.supabase.from('tx_gsc_queries').upsert(
                {
                  query,
                  clicks: row.clicks ?? 0,
                  impressions: row.impressions ?? 0,
                  ctr: row.ctr ?? 0,
                  position: row.position ?? 0,
                  country,
                  device,
                  updated_at: syncStartedAt,
                },
                { onConflict: 'query,country', ignoreDuplicates: false }
              ).throwOnError().catch(() => {}); // non-blocking backward compat
            }
          }
        } catch (dimErr: any) {
          errors.push(`[${label}] fetch error: ${dimErr.message}`);
        }
      }

      // Trigger opportunity recalculation (async RPC)
      await this.supabase.rpc('calculate_udx_opportunities', { p_tenant_id: tenantId });

      await this.writeAuditLog(tenantId, runId, 'gsc_sync_complete', 'SUCCESS', {
        rowsInserted,
        rowsUpdated,
        errorCount: errors.length,
      });

      return { success: true, rowsInserted, rowsUpdated, errors, runId };

    } catch (fatalErr: any) {
      await this.writeAuditLog(tenantId, runId, 'gsc_sync_fatal', 'FAILED', {
        error: fatalErr.message,
      });
      throw fatalErr;
    }
  }

  async checkHealth(): Promise<ConnectorHealth> {
    const checkStart = Date.now();

    // Verify credentials exist
    const hasCredentials =
      !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) ||
      !!(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REFRESH_TOKEN);

    if (!hasCredentials) {
      return {
        status: 'failed',
        lastCheck: new Date().toISOString(),
        error: 'Missing Google OAuth credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, or GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET + GOOGLE_OAUTH_REFRESH_TOKEN.',
      };
    }

    try {
      // Real liveness probe: fetch a token and verify it returns 200
      const token = await this.getAccessToken();
      const probeUrl = 'https://www.googleapis.com/webmasters/v3/sites';
      const response = await fetch(probeUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latencyMs = Date.now() - checkStart;

      if (response.ok) {
        return { status: 'healthy', lastCheck: new Date().toISOString(), latencyMs };
      } else {
        return {
          status: 'degraded',
          lastCheck: new Date().toISOString(),
          latencyMs,
          error: `GSC API returned HTTP ${response.status}`,
        };
      }
    } catch (err: any) {
      return {
        status: 'failed',
        lastCheck: new Date().toISOString(),
        error: err.message,
      };
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Paginates through all GSC rows for a given dimension set.
   * Google API is bounded to ROW_LIMIT per request; loop until exhausted.
   */
  private async fetchAllRows(
    accessToken: string,
    siteUrl: string,
    startDate: string,
    endDate: string,
    dimensions: string[]
  ): Promise<GSCRow[]> {
    const allRows: GSCRow[] = [];
    let startRow = 0;

    while (true) {
      const body = {
        startDate,
        endDate,
        dimensions,
        rowLimit: this.ROW_LIMIT,
        startRow,
        dataState: 'final',
      };

      const encodedSite = encodeURIComponent(siteUrl);
      const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`GSC API error ${response.status}: ${errBody}`);
      }

      const data = await response.json() as { rows?: GSCRow[] };
      const rows = data.rows ?? [];
      allRows.push(...rows);

      // If we got fewer rows than the limit, we've exhausted the dataset
      if (rows.length < this.ROW_LIMIT) break;
      startRow += this.ROW_LIMIT;
    }

    return allRows;
  }

  /**
   * Returns a valid access token.
   * Prefers Service Account JSON, falls back to OAuth2 refresh token.
   * Token is never exposed to the browser.
   */
  private async getAccessToken(): Promise<string> {
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (serviceEmail && serviceKey) {
      return this.getServiceAccountToken(serviceEmail, serviceKey);
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      return this.refreshOAuthToken(clientId, clientSecret, refreshToken);
    }

    throw new Error(
      '[GSCConnector] No Google credentials configured. ' +
      'Provide GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ' +
      'or GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET + GOOGLE_OAUTH_REFRESH_TOKEN.'
    );
  }

  /** Mints a JWT and exchanges it for an access token using Service Account credentials. */
  private async getServiceAccountToken(email: string, privateKey: string): Promise<string> {
    const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
    const now = Math.floor(Date.now() / 1000);

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })).toString('base64url');

    // Sign with RS256 using built-in Node.js crypto
    const { createSign } = await import('crypto');
    const sign = createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(privateKey, 'base64url');
    const jwt = `${header}.${payload}.${signature}`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      throw new Error(`[GSCConnector] Service account token exchange failed: ${err}`);
    }

    const tokenData = await tokenResponse.json() as { access_token: string };
    return tokenData.access_token;
  }

  /** Exchanges a refresh token for a new access token. */
  private async refreshOAuthToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[GSCConnector] OAuth token refresh failed: ${err}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  /** Lowercase, strip punctuation, trim, collapse whitespace. */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async writeAuditLog(
    tenantId: string,
    runId: string,
    action: string,
    status: 'SUCCESS' | 'FAILED',
    metadata: Record<string, unknown>
  ): Promise<void> {
    await this.supabase.from('udx_audit_log').insert({
      tenant_id: tenantId,
      log_type: 'EXECUTION',
      actor: 'GSC_CONNECTOR',
      action_taken: action,
      policy_class: 'AUTO',
      outcome: status === 'SUCCESS' ? 'AUTO_EXECUTED' : 'FORBIDDEN_BLOCKED',
      metadata: { runId, ...metadata },
    });
  }
}

interface GSCRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}
