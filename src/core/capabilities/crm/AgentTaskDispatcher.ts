import { supabase } from '@/integrations/supabase/client';
import { AgentTaskRecord } from './types';

export class AgentTaskDispatcher {
  /**
   * Enqueue a new agent task (e.g. called when a lead is created or activity added)
   */
  static async enqueueTask(
    businessId: string,
    taskType: AgentTaskRecord['task_type'],
    leadId?: string,
    payload: Record<string, any> = {}
  ): Promise<AgentTaskRecord | null> {
    try {
      const { data, error } = await supabase
        .from('crm_agent_tasks')
        .insert({
          business_id: businessId,
          lead_id: leadId,
          task_type: taskType,
          payload,
          status: 'pending',
          attempts: 0,
        })
        .select('*')
        .single();

      if (error) {
        console.error('[AgentTaskDispatcher] Error enqueuing task:', error);
        return null;
      }
      return data as AgentTaskRecord;
    } catch (err) {
      console.error('[AgentTaskDispatcher] Exception enqueuing task:', err);
      return null;
    }
  }

  /**
   * Fetch pending agent tasks for a business profile
   */
  static async getPendingTasks(businessId: string, limit = 10): Promise<AgentTaskRecord[]> {
    try {
      const { data, error } = await supabase
        .from('crm_agent_tasks')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('[AgentTaskDispatcher] Error fetching pending tasks:', error);
        return [];
      }
      return (data || []) as AgentTaskRecord[];
    } catch (err) {
      console.error('[AgentTaskDispatcher] Exception fetching pending tasks:', err);
      return [];
    }
  }

  /**
   * Update a task's status and store results or error log
   */
  static async updateTaskStatus(
    taskId: string,
    status: AgentTaskRecord['status'],
    result?: any,
    errorLog?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (result !== undefined) updateData.result = result;
      if (errorLog !== undefined) updateData.error_log = errorLog;

      const { error } = await supabase
        .from('crm_agent_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('[AgentTaskDispatcher] Error updating task status:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[AgentTaskDispatcher] Exception updating task status:', err);
      return false;
    }
  }
}
