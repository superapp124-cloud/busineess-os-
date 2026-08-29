/**
 * CHATR Media Agency — Production Queue Engine & State Machine
 * 
 * Manages post lifecycle states, supervised-vs-autonomous gate transitions,
 * platform dispatch workers, and telemetry polling jobs.
 */

import { CandidateVariant } from '../intelligence/CandidateRanker';
import { SupportedPlatform } from '../platforms/TokenVault';
import { MetaGraphAdapter } from '../platforms/MetaGraphAdapter';
import { YouTubeAdapter } from '../platforms/YouTubeAdapter';
import { KillSwitchMiddleware } from './KillSwitchMiddleware';
import { AuditLogger } from '../telemetry/AuditLogger';

export type PostQueueStatus = 
  | 'DRAFT'
  | 'QUEUED'
  | 'RENDERING'
  | 'READY_FOR_REVIEW'
  | 'SCHEDULED'
  | 'DISPATCHING'
  | 'PUBLISHED'
  | 'POLLING_METRICS'
  | 'FAILED'
  | 'PAUSED_BY_KILL_SWITCH';

export type OperatingMode = 'SUPERVISED' | 'AUTONOMOUS';

export interface QueueJob {
  id: string;
  topic: string;
  niche: string;
  selectedVariant: CandidateVariant;
  targetPlatforms: SupportedPlatform[];
  status: PostQueueStatus;
  scheduledTime: string;
  operatingMode: OperatingMode;
  mediaAssetId?: string;
  publishedResults: Record<string, { platformPostId: string; url: string; publishedAt: string }>;
  telemetry?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
}

const QUEUE_STORAGE_KEY = 'chatr_media_production_queue';
const MODE_STORAGE_KEY = 'chatr_media_operating_mode';

class QueueEngineService {
  private jobs: Map<string, QueueJob> = new Map();
  private mode: OperatingMode = 'SUPERVISED';
  private subscribers: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedJobs = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedJobs) {
        const parsed: QueueJob[] = JSON.parse(storedJobs);
        parsed.forEach(j => this.jobs.set(j.id, j));
      }

      const storedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (storedMode) {
        this.mode = storedMode as OperatingMode;
      }
    } catch (e) {
      console.error('Failed to load QueueEngine state', e);
    }
  }

  private persist() {
    try {
      const list = Array.from(this.jobs.values());
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(MODE_STORAGE_KEY, this.mode);
    } catch (e) {
      console.error('Failed to persist QueueEngine state', e);
    }
    this.notifySubscribers();
  }

  public getOperatingMode(): OperatingMode {
    return this.mode;
  }

  public setOperatingMode(mode: OperatingMode, actor: string = 'SuperAdmin'): void {
    this.mode = mode;
    AuditLogger.log({
      eventType: 'AGENT_MODE_CHANGED',
      actor,
      details: `Operating mode changed to [${mode}].`,
      severity: 'WARNING',
      metadata: { mode }
    });
    this.persist();
  }

  public enqueueJob(
    topic: string, 
    niche: string, 
    variant: CandidateVariant, 
    platforms: SupportedPlatform[]
  ): QueueJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // In Autonomous mode: if score >= 85, auto-schedule. In Supervised mode: place in READY_FOR_REVIEW
    const initialStatus: PostQueueStatus = (this.mode === 'AUTONOMOUS' && variant.compositeScore >= 85)
      ? 'SCHEDULED'
      : 'READY_FOR_REVIEW';

    const job: QueueJob = {
      id: jobId,
      topic,
      niche,
      selectedVariant: variant,
      targetPlatforms: platforms,
      status: initialStatus,
      scheduledTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins drop window
      operatingMode: this.mode,
      publishedResults: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);
    this.persist();
    return job;
  }

  public approveJob(jobId: string, actor: string = 'SuperAdmin'): QueueJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    job.status = 'SCHEDULED';
    job.updatedAt = new Date().toISOString();
    this.persist();

    AuditLogger.log({
      eventType: 'DISPATCH_COMMENCED',
      actor,
      details: `Super Admin manually approved job [${jobId}] for dispatch: "${job.selectedVariant.hookText}"`,
      severity: 'INFO',
      metadata: { jobId, platforms: job.targetPlatforms }
    });

    return job;
  }

  public rejectJob(jobId: string, actor: string = 'SuperAdmin'): QueueJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    job.status = 'FAILED';
    job.errorMessage = 'Rejected by Super Admin during review';
    job.updatedAt = new Date().toISOString();
    this.persist();
    return job;
  }

  /**
   * Dispatches a scheduled job across all target platforms with Kill Switch validation
   */
  public async executeJobDispatch(jobId: string, connectionMap: Record<SupportedPlatform, string>): Promise<QueueJob> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    // Check Kill Switch state immediately
    if (KillSwitchMiddleware.isEngaged()) {
      job.status = 'PAUSED_BY_KILL_SWITCH';
      job.errorMessage = 'Dispatch paused by Emergency Kill Switch';
      this.persist();
      throw new Error('Kill switch is engaged');
    }

    job.status = 'DISPATCHING';
    this.persist();

    const metaAdapter = new MetaGraphAdapter();
    const ytAdapter = new YouTubeAdapter();

    for (const platform of job.targetPlatforms) {
      const connId = connectionMap[platform];
      if (!connId) continue;

      try {
        const metadata = {
          title: job.topic,
          caption: `${job.selectedVariant.hookText}\n\n${job.selectedVariant.bodyScript}\n\n${job.selectedVariant.callToAction}`,
          tags: [job.niche, 'ai', 'growth', 'business', 'scaling'],
          visibility: 'PUBLIC' as const,
          niche: job.niche,
          hookVariantId: job.selectedVariant.id
        };

        const mediaAsset = {
          id: `asset_${job.id}`,
          type: 'video_short' as const,
          aspectRatio: '9:16' as const,
          durationSeconds: job.selectedVariant.estimatedDuration
        };

        let result;
        if (platform === 'youtube') {
          result = await ytAdapter.publish(connId, mediaAsset, metadata);
        } else {
          const adapter = new MetaGraphAdapter(platform as 'instagram' | 'facebook');
          result = await adapter.publish(connId, mediaAsset, metadata);
        }

        job.publishedResults[platform] = {
          platformPostId: result.platformPostId,
          url: result.platformUrl,
          publishedAt: result.publishedAt
        };
      } catch (err: any) {
        console.error(`Failed dispatch to ${platform}:`, err);
        job.errorMessage = `Partial failure on ${platform}: ${err.message}`;
      }
    }

    job.status = Object.keys(job.publishedResults).length > 0 ? 'PUBLISHED' : 'FAILED';
    job.updatedAt = new Date().toISOString();
    this.persist();
    return job;
  }

  public getJobs(): QueueJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try { cb(); } catch (e) { console.error('Queue subscriber error', e); }
    });
  }
}

export const QueueEngine = new QueueEngineService();
