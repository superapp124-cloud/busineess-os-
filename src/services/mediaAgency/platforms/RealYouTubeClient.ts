/**
 * CHATR Media Agency — Real YouTube Data API v3 Client
 * 
 * Official YouTube Data API v3 and Google OAuth 2.0 integration.
 * Handles channel discovery, resumable Shorts upload, and YouTube Analytics retrieval.
 */

import { KillSwitchMiddleware } from '../orchestrator/KillSwitchMiddleware';
import { AuditLogger } from '../telemetry/AuditLogger';

export interface YouTubeChannelInfo {
  channelId: string;
  title: string;
  customUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  avatarUrl?: string;
}

export class RealYouTubeClient {
  private static YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
  private static UPLOAD_BASE = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

  /**
   * Generates official Google OAuth 2.0 Authorization URL for YouTube
   */
  public static getOAuthUrl(clientId: string, redirectUri: string, state: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ].join(' ');

    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}&access_type=online`;
  }

  /**
   * Fetches authenticated YouTube channel profile & live subscriber metrics
   */
  public static async verifyAndGetChannel(accessToken: string): Promise<YouTubeChannelInfo> {
    const res = await fetch(`${this.YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`YouTube API verification failed (${res.status}): ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) throw new Error('No YouTube channel found for this Google account.');

    return {
      channelId: item.id,
      title: item.snippet?.title || 'Unknown Channel',
      customUrl: item.snippet?.customUrl,
      subscriberCount: parseInt(item.statistics?.subscriberCount || '0', 10),
      videoCount: parseInt(item.statistics?.videoCount || '0', 10),
      viewCount: parseInt(item.statistics?.viewCount || '0', 10),
      avatarUrl: item.snippet?.thumbnails?.default?.url
    };
  }

  /**
   * Uploads a YouTube Short using Google's Resumable Upload protocol
   */
  public static async uploadShort(
    accessToken: string,
    videoBlob: Blob,
    title: string,
    description: string,
    tags: string[] = ['Shorts', 'business', 'scaling', 'ai']
  ): Promise<{ videoId: string; url: string }> {
    // 1. Enforce Kill Switch at physical boundary
    KillSwitchMiddleware.assertDispatchAllowed('youtube', `Upload Short: ${title}`);

    AuditLogger.log({
      eventType: 'PUBLISH_ATTEMPT',
      actor: 'RealYouTubeClient',
      details: `Starting YouTube Short resumable upload: "${title}" (Size: ${(videoBlob.size / 1024).toFixed(1)} KB)`,
      severity: 'INFO',
      metadata: { title, sizeBytes: videoBlob.size }
    });

    // Step 1: Initiate Resumable Upload Session
    const metadata = {
      snippet: {
        title: title.endsWith('#Shorts') ? title : `${title} #Shorts`,
        description: `${description}\n\n#Shorts #business #scaling`,
        tags,
        categoryId: '28' // Science & Technology
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    };

    const initRes = await fetch(this.UPLOAD_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': videoBlob.type || 'video/webm',
        'X-Upload-Content-Length': String(videoBlob.size)
      },
      body: JSON.stringify(metadata)
    });

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}));
      throw new Error(`Failed to initialize YouTube upload session: ${err.error?.message || initRes.statusText}`);
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) {
      throw new Error('YouTube did not return a resumable upload Location header.');
    }

    // Step 2: Upload Video Binary
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': videoBlob.type || 'video/webm'
      },
      body: videoBlob
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(`YouTube video chunk upload failed: ${err.error?.message || uploadRes.statusText}`);
    }

    const data = await uploadRes.json();
    const videoId = data.id;
    const url = `https://youtube.com/shorts/${videoId}`;

    AuditLogger.log({
      eventType: 'PUBLISH_SUCCESS',
      actor: 'RealYouTubeClient',
      details: `YouTube Short published live! Video ID: ${videoId}`,
      severity: 'INFO',
      metadata: { videoId, url }
    });

    return { videoId, url };
  }

  /**
   * Fetches real video statistics from YouTube Data API
   */
  public static async fetchVideoStats(accessToken: string, videoId: string): Promise<Record<string, number>> {
    try {
      const res = await fetch(`${this.YOUTUBE_API_BASE}/videos?part=statistics&id=${encodeURIComponent(videoId)}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!res.ok) return {};

      const data = await res.json();
      const stats = data.items?.[0]?.statistics || {};
      return {
        views: parseInt(stats.viewCount || '0', 10),
        likes: parseInt(stats.likeCount || '0', 10),
        comments: parseInt(stats.commentCount || '0', 10)
      };
    } catch {
      return {};
    }
  }
}
