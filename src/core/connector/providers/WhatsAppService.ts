/**
 * WhatsAppService — Simulates fetching messages from WhatsApp.
 * 
 * Note: Unlike Gmail which has a public REST API callable from the browser,
 * WhatsApp Web uses a proprietary WebSocket protocol (Noise protocol).
 * A true real-world implementation requires a backend Node.js service running
 * something like 'whatsapp-web.js' (Puppeteer) or the official WhatsApp Business API.
 * 
 * For this frontend-only Phase 1, we simulate the fetch after connection.
 */

export interface WhatsAppMessage {
  id: string;
  source: 'WhatsApp';
  sender: string;
  senderPhone: string;
  subject: string;
  preview: string;
  time: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  threadId: string;
}

/**
 * Simulates fetching WhatsApp messages.
 */
export async function fetchWhatsAppMessages(): Promise<WhatsAppMessage[]> {
  try {
    const res = await fetch('http://localhost:3001/api/whatsapp/messages?limit=20');
    
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('WhatsApp client is not ready. Please run the backend server and scan the QR code.');
      }
      throw new Error(`Backend returned ${res.status}`);
    }
    
    const data = await res.json();
    return data.messages || [];
  } catch (err: any) {
    console.error('[WhatsAppService] Failed to fetch real WhatsApp messages:', err);
    throw new Error(err.message === 'Failed to fetch' 
      ? 'Backend server not running. Start it with: cd server && npm i && node index.js'
      : err.message);
  }
}
