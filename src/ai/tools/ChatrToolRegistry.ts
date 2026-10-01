/**
 * CHATR SI OS — ChatrToolRegistry
 * src/ai/tools/ChatrToolRegistry.ts
 *
 * Central Tool Registry with explicit permission risk levels and execution policies.
 * Connects the PersonalAgent reasoning loop to native and OS-level capabilities.
 */

import { ToolDefinition } from './types';
import { healthQueryEngine } from '@/services/health/HealthQueryEngine';

export class ChatrToolRegistry {
  private static instance: ChatrToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();

  private constructor() {
    this.registerDefaultTools();
  }

  public static getInstance(): ChatrToolRegistry {
    if (!ChatrToolRegistry.instance) {
      ChatrToolRegistry.instance = new ChatrToolRegistry();
    }
    return ChatrToolRegistry.instance;
  }

  private registerDefaultTools(): void {
    // 1. Reminders
    this.register({
      toolId: 'set_reminder',
      name: 'setReminder',
      description: 'Sets a reminder for a specific date and time.',
      category: 'reminders',
      parametersSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          datetime: { type: 'string' },
        },
        required: ['title'],
      },
      requiredPermissions: ['NOTIFICATIONS'],
      riskLevel: 'LEVEL_2_REVERSIBLE',
      executionPolicy: 'AUTO_EXECUTE',
      execute: async (params) => ({
        success: true,
        data: { id: `rem_${Date.now()}`, ...params },
        message: `Reminder set: "${params.title}" at ${params.datetime || 'scheduled time'}.`,
      }),
    });

    // 2. Health Tool (HEALTH OS GATEWAY — Clinical safety rules are authoritative)
    this.register({
      toolId: 'query_health_vitals',
      name: 'queryHealthVitals',
      description: 'Queries local Health OS for blood pressure, sleep, heart rate, or state.',
      category: 'health',
      parametersSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
      requiredPermissions: ['HEALTH_DATA_READ'],
      riskLevel: 'LEVEL_1_SAFE_READ',
      executionPolicy: 'HEALTH_OS_GATEWAY',
      execute: async (params) => {
        const queryText = String(params.query || 'vitals status');
        const res = healthQueryEngine.query(queryText);
        return {
          success: true,
          data: res,
          message: res.answer,
        };
      },
    });

    // 3. Calendar
    this.register({
      toolId: 'query_calendar',
      name: 'queryCalendar',
      description: 'Retrieves events and meetings for a date range.',
      category: 'calendar',
      parametersSchema: {
        type: 'object',
        properties: {
          date: { type: 'string' },
        },
      },
      requiredPermissions: ['CALENDAR_READ'],
      riskLevel: 'LEVEL_1_SAFE_READ',
      executionPolicy: 'AUTO_EXECUTE',
      execute: async (params) => ({
        success: true,
        data: [{ id: 'evt_1', title: 'Strategy Sync', time: '10:30 AM' }],
        message: 'Retrieved 1 event for today.',
      }),
    });

    // 4. Contacts
    this.register({
      toolId: 'search_contacts',
      name: 'searchContacts',
      description: 'Searches local address book for contacts.',
      category: 'contacts',
      parametersSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
      requiredPermissions: ['CONTACTS_READ'],
      riskLevel: 'LEVEL_1_SAFE_READ',
      executionPolicy: 'AUTO_EXECUTE',
      execute: async (params) => ({
        success: true,
        data: [{ name: params.query, phone: '+91 98765 43210' }],
        message: `Found contact matching "${params.query}".`,
      }),
    });

    // 5. Messaging (LEVEL 3: Sensitive / Irreversible)
    this.register({
      toolId: 'send_message',
      name: 'sendMessage',
      description: 'Sends an SMS or chat message to a contact.',
      category: 'messages',
      parametersSchema: {
        type: 'object',
        properties: {
          recipient: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['recipient', 'body'],
      },
      requiredPermissions: ['SMS_SEND'],
      riskLevel: 'LEVEL_3_SENSITIVE',
      executionPolicy: 'CONFIRMATION_REQUIRED',
      execute: async (params) => ({
        success: true,
        data: params,
        message: `Message sent to ${params.recipient}.`,
      }),
    });

    // 6. Navigation
    this.register({
      toolId: 'navigate_location',
      name: 'navigateLocation',
      description: 'Opens internal or external map directions.',
      category: 'navigation',
      parametersSchema: {
        type: 'object',
        properties: {
          destination: { type: 'string' },
        },
        required: ['destination'],
      },
      requiredPermissions: [],
      riskLevel: 'LEVEL_1_SAFE_READ',
      executionPolicy: 'AUTO_EXECUTE',
      execute: async (params) => ({
        success: true,
        data: params,
        message: `Navigating to ${params.destination}.`,
      }),
    });

    // 7. Wallet (LEVEL 3: Financial Action)
    this.register({
      toolId: 'transfer_money_upi',
      name: 'transferMoneyUPI',
      description: 'Initiates a UPI payment.',
      category: 'wallet',
      parametersSchema: {
        type: 'object',
        properties: {
          vpa: { type: 'string' },
          amount: { type: 'number' },
        },
        required: ['vpa', 'amount'],
      },
      requiredPermissions: ['PAYMENTS'],
      riskLevel: 'LEVEL_3_SENSITIVE',
      executionPolicy: 'CONFIRMATION_REQUIRED',
      execute: async (params) => ({
        success: true,
        data: params,
        message: `Payment of ₹${params.amount} to ${params.vpa} initiated.`,
      }),
    });

    // 8. Work Task Summaries
    this.register({
      toolId: 'summarize_work_tasks',
      name: 'summarizeWorkTasks',
      description: 'Summarizes work tasks and action items.',
      category: 'work',
      parametersSchema: {
        type: 'object',
        properties: {
          filter: { type: 'string' },
        },
      },
      requiredPermissions: [],
      riskLevel: 'LEVEL_1_SAFE_READ',
      executionPolicy: 'AUTO_EXECUTE',
      execute: async () => ({
        success: true,
        data: ['Call John', 'Review proposal', 'Send report'],
        message: 'Summarized 3 active tasks.',
      }),
    });
  }

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.toolId, tool);
  }

  public getTool(toolId: string): ToolDefinition | undefined {
    return this.tools.get(toolId) || Array.from(this.tools.values()).find(t => t.name.toLowerCase() === toolId.toLowerCase());
  }

  public listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public formatForLLM(): Array<{ name: string; description: string; parameters: Record<string, unknown> }> {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: `${t.description} [Risk: ${t.riskLevel}]`,
      parameters: t.parametersSchema,
    }));
  }
}

export const chatrToolRegistry = ChatrToolRegistry.getInstance();
