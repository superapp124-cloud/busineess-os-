import { supabase } from '@/integrations/supabase/client';
import { generateSitemapXML, generateSitemapEntries } from '@/utils/sitemapGenerator';

const GSC_SYNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gsc-sync`;
const GSC_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface GSCPropertyMetrics {
  domain: string;
  role: string;
  status: 'CONNECTED' | 'PROCESSING_DATA' | 'LOADING';
  totalClicks: number;
  totalImpressions: number;
  avgPosition: number;
  avgCTR: number;
  totalQueries: number;
  totalOpportunities: number;
  lastSyncTime: string;
}

export interface SEOContentGovernorConfig {
  dailyPublishLimit: number;
  publishedToday: number;
  qualityCheckRequired: boolean;
  duplicateCheckRequired: boolean;
  cannibalizationCheckRequired: boolean;
  indexabilityCheckRequired: boolean;
  governorStatus: 'ACTIVE_HEALTHY' | 'DAILY_LIMIT_REACHED' | 'QUALITY_BLOCKED';
}

export interface SEOQueueItem {
  id: string;
  query: string;
  targetDomain: 'chatr.chat' | 'chatrchat.in' | 'talentxcel.in' | 'talentxcel.net';
  suggestedSlug: string;
  status: 'PUBLISHED' | 'READY_TO_PUBLISH' | 'ANALYSIS_COMPLETE' | 'OPPORTUNITY_DETECTED';
  sitemapIndexed: boolean;
  indexStatus: 'INDEXED' | 'WAITING' | 'QUEUED';
  visitors: number;
  qualityScore: number;
  canonicalVerified: boolean;
}

// Known domains monitored in GSC
const DOMAIN_META: Record<string, { role: string }> = {
  'chatrchat.in': { role: 'CHATR Business — B2B Enterprise Business OS' },
  'chatr.chat': { role: 'CHATR Chat — Universal Inbox & Chat SI' },
  'talentxcel.in': { role: 'TALENTXCEL (IN) — Recruitment OS & SI Resume OCR' },
  'talentxcel.net': { role: 'TALENTXCEL (NET) — Global Recruitment Network & Enterprise API' },
};

export class AcquisitionEngineService {
  private static instance: AcquisitionEngineService;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  // Cached live data
  private liveMetrics: GSCPropertyMetrics[] | null = null;
  private metricsLoadedAt: number = 0;
  private readonly METRICS_TTL_MS = 5 * 60 * 1000; // 5-minute client-side cache

  // SEO Content Governor Configuration
  private governorConfig: SEOContentGovernorConfig = {
    dailyPublishLimit: 3,
    publishedToday: 0,
    qualityCheckRequired: true,
    duplicateCheckRequired: true,
    cannibalizationCheckRequired: true,
    indexabilityCheckRequired: true,
    governorStatus: 'ACTIVE_HEALTHY',
  };

  // High-intent SEO queue (product-led commercial pillars)
  private seoQueue: SEOQueueItem[] = [
    {
      id: 'queue_001',
      query: 'whatsapp team inbox for business',
      targetDomain: 'chatrchat.in',
      suggestedSlug: '/whatsapp-team-inbox',
      status: 'PUBLISHED',
      sitemapIndexed: true,
      indexStatus: 'WAITING',
      visitors: 0,
      qualityScore: 98,
      canonicalVerified: true,
    },
    {
      id: 'queue_002',
      query: 'wati alternative whatsapp business',
      targetDomain: 'chatrchat.in',
      suggestedSlug: '/wati-alternative',
      status: 'PUBLISHED',
      sitemapIndexed: true,
      indexStatus: 'WAITING',
      visitors: 0,
      qualityScore: 96,
      canonicalVerified: true,
    },
    {
      id: 'queue_003',
      query: 'whatsapp candidate screening automation',
      targetDomain: 'chatrchat.in',
      suggestedSlug: '/whatsapp-candidate-screening',
      status: 'READY_TO_PUBLISH',
      sitemapIndexed: false,
      indexStatus: 'QUEUED',
      visitors: 0,
      qualityScore: 93,
      canonicalVerified: false,
    },
    {
      id: 'queue_004',
      query: 'ai resume parser candidate screening',
      targetDomain: 'talentxcel.in',
      suggestedSlug: '/talentxcel/ai-resume-parser',
      status: 'ANALYSIS_COMPLETE',
      sitemapIndexed: false,
      indexStatus: 'QUEUED',
      visitors: 0,
      qualityScore: 91,
      canonicalVerified: false,
    },
  ];

  public static getInstance(): AcquisitionEngineService {
    if (!AcquisitionEngineService.instance) {
      AcquisitionEngineService.instance = new AcquisitionEngineService();
    }
    return AcquisitionEngineService.instance;
  }

  /**
   * Fetch live GSC metrics from Supabase (gsc_queries table).
   * Falls back to stub data with status=LOADING if Supabase is unreachable.
   * Results are cached for METRICS_TTL_MS to avoid hammering the DB.
   */
  public async fetchLiveGSCProperties(): Promise<GSCPropertyMetrics[]> {
    const now = Date.now();
    if (this.liveMetrics && now - this.metricsLoadedAt < this.METRICS_TTL_MS) {
      return this.liveMetrics;
    }

    try {
      // Pull aggregated metrics per property from gsc_queries
      const { data: rows, error } = await supabase
        .from('gsc_queries')
        .select('property_id, clicks, impressions, position, ctr');

      if (error) throw error;

      // Group by property_id
      const byProperty: Record<string, { clicks: number; impressions: number; positions: number[]; count: number }> = {};
      for (const r of rows ?? []) {
        const pid: string = r.property_id ?? 'sc-domain:chatrchat.in';
        if (!byProperty[pid]) byProperty[pid] = { clicks: 0, impressions: 0, positions: [], count: 0 };
        byProperty[pid].clicks += r.clicks ?? 0;
        byProperty[pid].impressions += r.impressions ?? 0;
        byProperty[pid].positions.push(r.position ?? 0);
        byProperty[pid].count++;
      }

      // Fetch opportunity counts
      const { data: opps } = await supabase
        .from('gsc_opportunities')
        .select('property_id');
      const oppCounts: Record<string, number> = {};
      for (const o of opps ?? []) {
        oppCounts[o.property_id] = (oppCounts[o.property_id] ?? 0) + 1;
      }

      // Build result — include all known domains even if no data yet
      const allDomains = Object.keys(DOMAIN_META);
      const syncTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const metrics: GSCPropertyMetrics[] = allDomains.map((domain) => {
        const pid = `sc-domain:${domain}`;
        const agg = byProperty[pid];
        if (!agg) {
          return {
            domain,
            role: DOMAIN_META[domain]?.role ?? domain,
            status: 'PROCESSING_DATA',
            totalClicks: 0,
            totalImpressions: 0,
            avgPosition: 0,
            avgCTR: 0,
            totalQueries: 0,
            totalOpportunities: oppCounts[pid] ?? 0,
            lastSyncTime: syncTime,
          };
        }
        const avgPos = agg.positions.length > 0
          ? agg.positions.reduce((a, b) => a + b, 0) / agg.positions.length
          : 0;
        const avgCTR = agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0;
        return {
          domain,
          role: DOMAIN_META[domain]?.role ?? domain,
          status: 'CONNECTED',
          totalClicks: agg.clicks,
          totalImpressions: agg.impressions,
          avgPosition: Math.round(avgPos * 10) / 10,
          avgCTR: Math.round(avgCTR * 100) / 100,
          totalQueries: agg.count,
          totalOpportunities: oppCounts[pid] ?? 0,
          lastSyncTime: syncTime,
        };
      });

      this.liveMetrics = metrics;
      this.metricsLoadedAt = now;
      return metrics;
    } catch (err) {
      console.warn('[AcquisitionEngineService] Live GSC fetch failed, returning stubs:', err);
      // Return loading stubs so UI doesn't break
      return Object.keys(DOMAIN_META).map((domain) => ({
        domain,
        role: DOMAIN_META[domain]?.role ?? domain,
        status: 'LOADING' as const,
        totalClicks: 0,
        totalImpressions: 0,
        avgPosition: 0,
        avgCTR: 0,
        totalQueries: 0,
        totalOpportunities: 0,
        lastSyncTime: '—',
      }));
    }
  }

  /**
   * Trigger a live GSC sync via the edge function.
   * Returns sync result summary.
   */
  public async triggerGSCSync(): Promise<{ success: boolean; rowsUpserted?: number; error?: string }> {
    try {
      const res = await fetch(GSC_SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GSC_ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      // Invalidate cache on successful sync
      this.liveMetrics = null;
      this.metricsLoadedAt = 0;
      return { success: data.success ?? false, rowsUpserted: data.rowsUpserted, error: data.error };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * @deprecated Use fetchLiveGSCProperties() instead.
   * Kept for backward compatibility with existing admin views.
   */
  public getGSCProperties(): GSCPropertyMetrics[] {
    return this.liveMetrics ?? Object.keys(DOMAIN_META).map((domain) => ({
      domain,
      role: DOMAIN_META[domain]?.role ?? domain,
      status: 'LOADING' as const,
      totalClicks: 0,
      totalImpressions: 0,
      avgPosition: 0,
      avgCTR: 0,
      totalQueries: 0,
      totalOpportunities: 0,
      lastSyncTime: '—',
    }));
  }

  public getSEOQueue(): SEOQueueItem[] {
    return this.seoQueue;
  }

  public getGovernorConfig(): SEOContentGovernorConfig {
    return this.governorConfig;
  }

  public async startLiveAcquisitionEngine(
    onStatusUpdate?: (queue: SEOQueueItem[]) => void
  ): Promise<void> {
    this.isRunning = true;
    await this.executeGovernedSEOPublishingLoop();
    if (onStatusUpdate) onStatusUpdate(this.seoQueue);

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.executeGovernedSEOPublishingLoop();
        if (onStatusUpdate) onStatusUpdate(this.seoQueue);
      }
    }, 15000);
  }

  public stopLiveAcquisitionEngine(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async executeGovernedSEOPublishingLoop(): Promise<void> {
    try {
      const sitemapEntries = generateSitemapEntries();
      await supabase.from('cc_logs').insert({
        agent: 'seo_governor_engine',
        action: `SEO Audit: 4 GSC Domains active. Sitemap: ${sitemapEntries.length} priority URLs.`,
        level: 'info',
        details: {
          governorConfig: this.governorConfig,
          queueStatus: this.seoQueue.map((q) => ({ query: q.query, status: q.status, indexStatus: q.indexStatus })),
          sitemapCount: sitemapEntries.length,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.error('SEO Governor execution note:', e);
    }
  }
}
