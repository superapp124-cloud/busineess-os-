import { EventMesh } from './EventMesh';

export interface IActivityEntry {
  id: string;
  capabilityId: string;
  type: 'creation' | 'update' | 'deletion' | 'approval' | 'alert' | 'ai-suggestion';
  title: string;
  description: string;
  recordId?: string;
  timestamp: number;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export class ActivityCentre {
  private static activities: IActivityEntry[] = [];
  private static listeners: ((activities: IActivityEntry[]) => void)[] = [];

  static log(entry: Omit<IActivityEntry, 'id' | 'timestamp' | 'read'>): void {
    const fullEntry: IActivityEntry = {
      ...entry,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      read: false
    };
    
    this.activities.unshift(fullEntry);
    
    // Keep only last 100
    if (this.activities.length > 100) {
      this.activities.pop();
    }
    
    this.notifyListeners();
    
    EventMesh.publish('activity.logged', fullEntry);
  }

  static getActivities(capabilityId?: string): IActivityEntry[] {
    if (capabilityId) {
      return this.activities.filter(a => a.capabilityId === capabilityId);
    }
    return this.activities;
  }

  static markAsRead(id: string): void {
    const act = this.activities.find(a => a.id === id);
    if (act) {
      act.read = true;
      this.notifyListeners();
    }
  }

  static subscribe(listener: (activities: IActivityEntry[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.activities);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(l => l(this.activities));
  }
}
