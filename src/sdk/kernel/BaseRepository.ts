import { supabase } from '@/integrations/supabase/client';
import { EventMesh } from './EventMesh';
import { ActivityCentre } from './ActivityCentre';

export interface IRepositoryConfig {
  capabilityId: string;
  tableName: string;
  objectName: string;
}

export abstract class BaseRepository<T extends { id: string }> {
  protected capabilityId: string;
  protected tableName: string;
  protected objectName: string;

  constructor(config: IRepositoryConfig) {
    this.capabilityId = config.capabilityId;
    this.tableName = config.tableName;
    this.objectName = config.objectName;
  }

  async list(filters?: Record<string, any>): Promise<T[]> {
    let query = supabase.from(this.tableName).select('*');
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as T[];
  }

  async get(id: string): Promise<T | null> {
    const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as T;
  }

  async create(data: Partial<T>): Promise<T> {
    const { data: created, error } = await supabase.from(this.tableName).insert(data).select().single();
    if (error) throw error;

    // Emit Kernel Event
    EventMesh.publish(`${this.objectName.toLowerCase()}.created`, {
      capabilityId: this.capabilityId,
      recordId: created.id,
      data: created
    });

    // Log Activity
    ActivityCentre.log({
      capabilityId: this.capabilityId,
      type: 'creation',
      title: `New ${this.objectName} Created`,
      description: `A new ${this.objectName.toLowerCase()} record was created.`,
      recordId: created.id
    });

    return created as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await supabase.from(this.tableName).update(data).eq('id', id).select().single();
    if (error) throw error;

    EventMesh.publish(`${this.objectName.toLowerCase()}.updated`, {
      capabilityId: this.capabilityId,
      recordId: updated.id,
      data: updated
    });

    return updated as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);
    if (error) throw error;

    EventMesh.publish(`${this.objectName.toLowerCase()}.deleted`, {
      capabilityId: this.capabilityId,
      recordId: id
    });
  }
}
