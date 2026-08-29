/**
 * CHATR Media Agency — Standardized Platform Publisher Contract
 * 
 * Defines the unified lifecycle interface for multi-platform distribution
 * across Instagram, Facebook, and YouTube.
 */

import { SupportedPlatform } from './TokenVault';

export interface MediaAsset {
  id: string;
  type: 'video_short' | 'video_reel' | 'carousel' | 'image';
  videoUrl?: string;
  thumbnailUrl?: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
  durationSeconds: number;
}

export interface PostMetadata {
  title: string;
  caption: string;
  tags: string[];
  scheduledTime?: string;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
  callToActionUrl?: string;
  niche: string;
  hookVariantId: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId: string;
  platformUrl: string;
  publishedAt: string;
  errorMessage?: string;
}

export interface PlatformMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watchTimeSeconds: number;
  averageViewDuration: number;
  retentionAt3sRate: number;
  retentionAtCompletionRate: number;
  profileVisits: number;
  followersGained: number;
  estimatedRevenue: number;
  rpm: number;
}

export interface IPlatformPublisher {
  readonly platform: SupportedPlatform;
  validateSession(connectionId: string): Promise<boolean>;
  publish(connectionId: string, asset: MediaAsset, metadata: PostMetadata): Promise<PublishResult>;
  fetchTelemetry(connectionId: string, platformPostId: string): Promise<PlatformMetrics>;
}
