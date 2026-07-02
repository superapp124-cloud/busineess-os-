import { LocalDB } from '../db/LocalDB';
import { Capacitor } from '@capacitor/core';
import '../../types/plugins';

export interface UnifiedSearchResult {
  id: string;
  source: 'mail' | 'sms' | 'call';
  title: string; // e.g. Sender Name
  subtitle: string; // e.g. Subject or first line
  timestamp: number;
}

export class SearchEngine {
  /**
   * Queries the local database and native SMS logs simultaneously.
   * Merges and sorts the results chronologically.
   */
  static async query(term: string): Promise<UnifiedSearchResult[]> {
    if (!term || term.trim().length < 2) {
      return [];
    }

    const lowerTerm = term.toLowerCase();
    const results: UnifiedSearchResult[] = [];

    // 1. Search Local Emails
    try {
      const allEmails = await LocalDB.getAllMessages();
      const matchedEmails = allEmails.filter(msg => 
        msg.subject.toLowerCase().includes(lowerTerm) || 
        msg.sender.toLowerCase().includes(lowerTerm) ||
        msg.snippet.toLowerCase().includes(lowerTerm)
      );

      for (const msg of matchedEmails) {
        results.push({
          id: msg.id,
          source: 'mail',
          title: msg.sender.split('@')[0] || msg.sender,
          subtitle: msg.subject,
          timestamp: msg.internalDate
        });
      }
    } catch (e) {
      console.warn('[SearchEngine] Failed to search emails', e);
    }

    // 2. Search Native SMS (If running natively)
    try {
      if (Capacitor.isNativePlatform() && Capacitor.Plugins.ChatrSafeSms) {
        // Since the mock ChatrSafeSms plugin may not implement a full text search method yet,
        // we fallback to getting recent conversations and filtering them locally for MVP.
        const { conversations } = await Capacitor.Plugins.ChatrSafeSms.getConversations({ limit: 100 });
        if (Array.isArray(conversations)) {
          const matchedSms = conversations.filter(conv => 
            (conv.displayName && conv.displayName.toLowerCase().includes(lowerTerm)) ||
            (conv.address && conv.address.toLowerCase().includes(lowerTerm)) ||
            (conv.lastBody && conv.lastBody.toLowerCase().includes(lowerTerm))
          );

          for (const sms of matchedSms) {
            results.push({
              id: sms.conversationId,
              source: 'sms',
              title: sms.displayName || sms.address,
              subtitle: sms.lastBody,
              timestamp: sms.lastTimestamp
            });
          }
        }
      } else {
        // Mock SMS Search for Web UI testing
        if ("apple".includes(lowerTerm) || "support".includes(lowerTerm)) {
          results.push({
            id: 'mock-sms-1',
            source: 'sms',
            title: 'Apple Support',
            subtitle: 'Your support case #19234 has been updated.',
            timestamp: Date.now() - 3600000
          });
        }
      }
    } catch (e) {
      console.warn('[SearchEngine] Failed to search SMS', e);
    }

    // Sort descending by timestamp
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to top 10 results for the quick dropdown
    return results.slice(0, 10);
  }
}
