import { Event } from './Event';
import { JsonValue } from '../types';

export interface DomainEvent extends Event {
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: JsonValue;
}
