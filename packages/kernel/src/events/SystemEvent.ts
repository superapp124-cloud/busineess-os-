import { Event } from './Event';
import { JsonValue } from '../types';

export interface SystemEvent extends Event {
  component: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  details?: JsonValue;
}
