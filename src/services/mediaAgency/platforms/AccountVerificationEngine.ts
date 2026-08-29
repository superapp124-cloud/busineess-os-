/**
 * CHATR Media Agency — Account Verification & Operational Readiness Engine
 * 
 * Verifies live OAuth connectivity, resolves real Channel/Page/Account IDs,
 * and maintains strict Pre-Production vs Live Production readiness status.
 */

import { TokenVault, OAuthAccountConnection, SupportedPlatform } from './TokenVault';
import { RealYouTubeClient, YouTubeChannelInfo } from './RealYouTubeClient';
import { RealMetaClient, MetaAccountInfo } from './RealMetaClient';
import { AuditLogger } from '../telemetry/AuditLogger';

export interface VerifiedAccountHealth {
  platform: SupportedPlatform;
  status: 'CONNECTED' | 'EXPIRING' | 'REAUTH_REQUIRED' | 'REVOKED' | 'DISCONNECTED' | 'ERROR';
  accountName?: string;
  accountHandle?: string;
  channelOrPageId?: string;
  permissions: {
    publishing: boolean;
    analytics: boolean;
  };
  lastVerifiedAt?: string;
  errorMessage?: string;
}

export interface OperationalReadinessReport {
  overallState: 'LIVE_PRODUCTION' | 'PRE_PRODUCTION';
  reasons: string[];
  accounts: Record<SupportedPlatform, VerifiedAccountHealth>;
  hasCompletedLiveEndToEndTest: boolean;
}

export class AccountVerificationEngine {
  private static LIVE_E2E_FLAG_KEY = 'chatr_media_e2e_verified_v1';

  /**
   * Evaluates end-to-end readiness across all 3 platforms
   */
  public static async evaluateReadiness(): Promise<OperationalReadinessReport> {
    const connections = TokenVault.getConnections();
    const hasE2E = localStorage.getItem(this.LIVE_E2E_FLAG_KEY) === 'true';

    const report: OperationalReadinessReport = {
      overallState: 'PRE_PRODUCTION',
      reasons: [],
      accounts: {
        youtube: { platform: 'youtube', status: 'DISCONNECTED', permissions: { publishing: false, analytics: false } },
        instagram: { platform: 'instagram', status: 'DISCONNECTED', permissions: { publishing: false, analytics: false } },
        facebook: { platform: 'facebook', status: 'DISCONNECTED', permissions: { publishing: false, analytics: false } }
      },
      hasCompletedLiveEndToEndTest: hasE2E
    };

    // 1. YouTube Verification
    const ytConn = connections.find(c => c.platform === 'youtube');
    if (ytConn && ytConn.status === 'ACTIVE') {
      try {
        const token = await TokenVault.getAccessToken(ytConn.id);
        const channel = await RealYouTubeClient.verifyAndGetChannel(token);
        report.accounts.youtube = {
          platform: 'youtube',
          status: 'CONNECTED',
          accountName: channel.title,
          accountHandle: channel.customUrl || channel.channelId,
          channelOrPageId: channel.channelId,
          permissions: { publishing: true, analytics: true },
          lastVerifiedAt: new Date().toISOString()
        };
      } catch (err: any) {
        report.accounts.youtube = {
          platform: 'youtube',
          status: 'ERROR',
          errorMessage: err.message,
          permissions: { publishing: false, analytics: false }
        };
        report.reasons.push(`YouTube API: ${err.message}`);
      }
    } else {
      report.reasons.push('YouTube account not connected via Google OAuth.');
    }

    // 2. Meta Verification (Instagram & Facebook)
    const metaConn = connections.find(c => c.platform === 'instagram' || c.platform === 'facebook');
    if (metaConn && metaConn.status === 'ACTIVE') {
      try {
        const token = await TokenVault.getAccessToken(metaConn.id);
        const discovered = await RealMetaClient.verifyAndDiscoverAccounts(token);
        const primaryPage = discovered[0];

        if (primaryPage) {
          report.accounts.facebook = {
            platform: 'facebook',
            status: 'CONNECTED',
            accountName: primaryPage.name,
            channelOrPageId: primaryPage.id,
            permissions: { publishing: true, analytics: true },
            lastVerifiedAt: new Date().toISOString()
          };

          if (primaryPage.instagramBusinessAccountId) {
            report.accounts.instagram = {
              platform: 'instagram',
              status: 'CONNECTED',
              accountName: `@${primaryPage.instagramUsername || 'instagram_creator'}`,
              accountHandle: primaryPage.instagramUsername,
              channelOrPageId: primaryPage.instagramBusinessAccountId,
              permissions: { publishing: true, analytics: true },
              lastVerifiedAt: new Date().toISOString()
            };
          }
        }
      } catch (err: any) {
        report.accounts.instagram = { platform: 'instagram', status: 'ERROR', errorMessage: err.message, permissions: { publishing: false, analytics: false } };
        report.accounts.facebook = { platform: 'facebook', status: 'ERROR', errorMessage: err.message, permissions: { publishing: false, analytics: false } };
        report.reasons.push(`Meta Graph API: ${err.message}`);
      }
    } else {
      report.reasons.push('Meta accounts (Instagram/Facebook) not connected via Meta OAuth.');
    }

    // Determine Overall State
    const allConnected = report.accounts.youtube.status === 'CONNECTED' && 
                         report.accounts.instagram.status === 'CONNECTED' && 
                         report.accounts.facebook.status === 'CONNECTED';

    if (allConnected && hasE2E) {
      report.overallState = 'LIVE_PRODUCTION';
    } else {
      report.overallState = 'PRE_PRODUCTION';
      if (!hasE2E) {
        report.reasons.push('End-to-End single video publishing & telemetry test has not been executed yet.');
      }
    }

    return report;
  }

  public static markEndToEndTestCompleted(): void {
    localStorage.setItem(this.LIVE_E2E_FLAG_KEY, 'true');
    AuditLogger.log({
      eventType: 'AGENT_COMPLETED',
      actor: 'SuperAdmin',
      details: 'End-to-End live publication test completed and verified on-platform.',
      severity: 'INFO'
    });
  }
}
