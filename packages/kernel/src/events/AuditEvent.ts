import { Event } from './Event';

export interface AuditEvent extends Event {
  actorId: string;
  action: string;
  resourceId: string;
  status: 'SUCCESS' | 'FAILURE';
  reason?: string;
}
