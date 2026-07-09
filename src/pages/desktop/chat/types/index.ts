import type { Message, Room } from '@/platform/Domain/Communication/MessagingService';

export type { Message, Room };

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type RightPaneTab = 'copilot' | 'outcomes' | 'timeline' | 'decisions' | 'notes';
