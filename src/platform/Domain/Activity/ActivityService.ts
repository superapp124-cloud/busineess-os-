import { IService } from '../../Shared/Types';
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from '../../Infrastructure/EventBus';
import { Logger } from '../../Infrastructure/Logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  userId?: string;
  actorName?: string;
  actorAvatar?: string;
  entityType: string;   // 'message' | 'task' | 'meeting' | 'file' | 'system'
  entityId?: string;
  action: string;       // human-readable: "sent a message", "completed a task"
  description: string;  // full description text
  metadata: Record<string, any>;
  createdAt: string;
}

export type ActivityFilter = 'all' | 'messages' | 'tasks' | 'meetings' | 'files' | 'ai';

// ─── Service ──────────────────────────────────────────────────────────────────

class ActivityServiceClass implements IService {
  name = 'ActivityService';
  dependencies = ['EventBus'];

  private listeners: Set<(item: ActivityItem) => void> = new Set();
  private realtimeChannel: any = null;
  private currentWorkspaceId: string | null = null;

  async initialize(): Promise<void> {
    Logger.info('[ActivityService] Initializing...');

    // Subscribe to EventBus to write activity records for platform events
    EventBus.subscribe('MessageSent', async (event) => {
      const { message, roomId } = event.payload;
      await this.writeActivity({
        entityType: 'message',
        entityId: message.id,
        action: 'sent_message',
        description: `Sent a message`,
        metadata: { roomId, preview: (message.content || '').slice(0, 100) },
        userId: message.senderId,
      });
    });

    EventBus.subscribe('TaskCreated', async (event) => {
      const { task } = event.payload;
      await this.writeActivity({
        entityType: 'task',
        entityId: task.id,
        action: 'created_task',
        description: `Created task: ${task.title}`,
        metadata: { priority: task.priority, listId: task.listId },
        userId: task.createdBy,
      });
    });

    EventBus.subscribe('TaskCompleted', async (event) => {
      const { task } = event.payload;
      await this.writeActivity({
        entityType: 'task',
        entityId: task.id,
        action: 'completed_task',
        description: `Completed: ${task.title}`,
        metadata: {},
        userId: task.createdBy,
      });
    });

    EventBus.subscribe('MeetingScheduled', async (event) => {
      const { event: calEvent } = event.payload;
      await this.writeActivity({
        entityType: 'meeting',
        entityId: calEvent.id,
        action: 'scheduled_meeting',
        description: `Scheduled: ${calEvent.title}`,
        metadata: { startAt: calEvent.startAt },
        userId: calEvent.organizerId,
      });
    });

    // Resolve workspace and start realtime subscription
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: memberRows } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1);
        this.currentWorkspaceId = memberRows?.[0]?.workspace_id ?? null;
        if (this.currentWorkspaceId) this.subscribeToActivityUpdates();
      }
    } catch (err) {
      Logger.warn('[ActivityService] Could not resolve workspace for realtime', err);
    }

    Logger.info('[ActivityService] Ready');
  }

  private subscribeToActivityUpdates(): void {
    // activity_logs table is not present in this schema
  }

  private mapActivityLog(row: any): ActivityItem {
    return {
      id: row.id,
      userId: row.user_id,
      entityType: row.entity_type || 'system',
      entityId: row.entity_id,
      action: row.action,
      description: row.action,
      metadata: row.metadata || {},
      createdAt: row.created_at,
    };
  }

  private async writeActivity(input: {
    entityType: string;
    entityId?: string;
    action: string;
    description: string;
    metadata: Record<string, any>;
    userId?: string;
  }): Promise<void> {
    // Activity logs are disabled when table is not in schema
  }

  async getRecentActivity(limit = 30, filter?: ActivityFilter): Promise<ActivityItem[]> {
    return [];
  }

  onNewActivity(callback: (item: ActivityItem) => void): () => void {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }

  async shutdown(): Promise<void> {
    if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel);
  }
}

export const ActivityService = new ActivityServiceClass();
