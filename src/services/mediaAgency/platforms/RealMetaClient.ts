/**
 * CHATR Media Agency — Real Meta Graph API Client
 * 
 * Official Meta Graph API v20.0 integration for Instagram Reels and Facebook Pages.
 * Handles OAuth URLs, Token verification, Container creation, Polling, and Real Publishing.
 */

import { KillSwitchMiddleware } from '../orchestrator/KillSwitchMiddleware';
import { AuditLogger } from '../telemetry/AuditLogger';

export interface MetaAccountInfo {
  id: string;
  name: string;
  instagramBusinessAccountId?: string;
  instagramUsername?: string;
  accessToken: string;
  category?: string;
}

export class RealMetaClient {
  private static GRAPH_BASE = 'https://graph.facebook.com/v20.0';

  /**
   * Generates official Meta OAuth 2.0 Authorization URL
   */
  public static getOAuthUrl(appId: string, redirectUri: string, state: string): string {
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_insights'
    ].join(',');

    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=token&state=${encodeURIComponent(state)}`;
  }

  /**
   * Validates access token and discovers connected Facebook Pages & Instagram Accounts
   */
  public static async verifyAndDiscoverAccounts(accessToken: string): Promise<MetaAccountInfo[]> {
    try {
      const meRes = await fetch(`${this.GRAPH_BASE}/me/accounts?fields=id,name,category,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`);
      
      if (!meRes.ok) {
        const errJson = await meRes.json().catch(() => ({}));
        throw new Error(`Meta API error (${meRes.status}): ${errJson.error?.message || meRes.statusText}`);
      }

      const data = await meRes.json();
      const pages: any[] = data.data || [];

      return pages.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        accessToken: p.access_token || accessToken,
        instagramBusinessAccountId: p.instagram_business_account?.id,
        instagramUsername: p.instagram_business_account?.username
      }));
    } catch (e: any) {
      console.error('Failed to verify Meta access token', e);
      throw e;
    }
  }

  /**
   * Publishes an Instagram Reel via official 2-step container flow
   */
  public static async publishInstagramReel(
    accessToken: string,
    igUserId: string,
    videoUrl: string,
    caption: string
  ): Promise<{ mediaId: string; permalink?: string }> {
    // 1. Enforce Kill Switch at boundary
    KillSwitchMiddleware.assertDispatchAllowed('instagram', `Publish Reel: ${caption.substring(0, 30)}`);

    AuditLogger.log({
      eventType: 'PUBLISH_ATTEMPT',
      actor: 'RealMetaClient',
      details: `Initiating Instagram Reel container creation for IG User [${igUserId}]`,
      severity: 'INFO',
      metadata: { igUserId, videoUrl }
    });

    // Step 1: Create Container
    const containerRes = await fetch(`${this.GRAPH_BASE}/${encodeURIComponent(igUserId)}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
        access_token: accessToken
      })
    });

    if (!containerRes.ok) {
      const err = await containerRes.json().catch(() => ({}));
      throw new Error(`Instagram Container Creation Failed: ${err.error?.message || containerRes.statusText}`);
    }

    const { id: containerId } = await containerRes.json();

    // Step 2: Poll container status until FINISHED
    let attempts = 0;
    let isReady = false;

    while (attempts < 20 && !isReady) {
      await new Promise(r => setTimeout(r, 3000));
      attempts++;

      const statusRes = await fetch(`${this.GRAPH_BASE}/${encodeURIComponent(containerId)}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status_code === 'FINISHED') {
          isReady = true;
        } else if (statusData.status_code === 'ERROR') {
          throw new Error(`Instagram Video Processing Error: ${statusData.status}`);
        }
      }
    }

    if (!isReady) {
      throw new Error('Instagram Container Processing Timeout (media taking too long to encode)');
    }

    // Step 3: Publish Media
    const publishRes = await fetch(`${this.GRAPH_BASE}/${encodeURIComponent(igUserId)}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: accessToken
      })
    });

    if (!publishRes.ok) {
      const err = await publishRes.json().catch(() => ({}));
      throw new Error(`Instagram Media Publish Failed: ${err.error?.message || publishRes.statusText}`);
    }

    const { id: mediaId } = await publishRes.json();

    AuditLogger.log({
      eventType: 'PUBLISH_SUCCESS',
      actor: 'RealMetaClient',
      details: `Instagram Reel published successfully! Media ID: ${mediaId}`,
      severity: 'INFO',
      metadata: { mediaId, containerId }
    });

    return {
      mediaId,
      permalink: `https://instagram.com/reel/${mediaId}`
    };
  }

  /**
   * Publishes video to a Facebook Page
   */
  public static async publishFacebookVideo(
    pageAccessToken: string,
    pageId: string,
    videoUrl: string,
    title: string,
    description: string
  ): Promise<{ videoId: string; permalink?: string }> {
    KillSwitchMiddleware.assertDispatchAllowed('facebook', `Publish FB Video: ${title}`);

    const res = await fetch(`${this.GRAPH_BASE}/${encodeURIComponent(pageId)}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: videoUrl,
        title,
        description,
        access_token: pageAccessToken
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Facebook Video Publish Failed: ${err.error?.message || res.statusText}`);
    }

    const { id: videoId } = await res.json();
    return {
      videoId,
      permalink: `https://facebook.com/watch/?v=${videoId}`
    };
  }

  /**
   * Fetches genuine insights for a published media asset
   */
  public static async fetchInsights(accessToken: string, igMediaId: string): Promise<Record<string, number>> {
    try {
      const res = await fetch(`${this.GRAPH_BASE}/${encodeURIComponent(igMediaId)}/insights?metric=plays,reach,saved,shares,total_interactions&access_token=${encodeURIComponent(accessToken)}`);
      if (!res.ok) return {};

      const data = await res.json();
      const metrics: Record<string, number> = {};
      (data.data || []).forEach((m: any) => {
        metrics[m.name] = m.values?.[0]?.value || 0;
      });
      return metrics;
    } catch {
      return {};
    }
  }
}
