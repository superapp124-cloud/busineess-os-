const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let qrCodeData = null;
let isReady = false;
let clientInfo = null;

console.log('Initializing WhatsApp Client...');

// Determine common Windows executable paths for Chrome or Edge
const fs = require('fs');
const getBrowserPath = () => {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null; // fallback to default puppeteer behavior
};

// Initialize WhatsApp Client with LocalAuth to persist session
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: getBrowserPath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

client.on('qr', (qr) => {
  console.log('\n[WhatsApp] Please scan this QR code with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
  qrCodeData = qr;
});

client.on('ready', () => {
  console.log('\n[WhatsApp] Client is ready and authenticated!');
  isReady = true;
  qrCodeData = null; // Clear QR code as we are connected
  clientInfo = client.info;
});

client.on('authenticated', () => {
  console.log('[WhatsApp] Authenticated successfully.');
});

client.on('auth_failure', msg => {
  console.error('[WhatsApp] Authentication failed:', msg);
  isReady = false;
});

client.on('disconnected', (reason) => {
  console.log('[WhatsApp] Client was disconnected:', reason);
  isReady = false;
  clientInfo = null;
});

client.initialize();

// API Endpoints

app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    isReady,
    hasQr: !!qrCodeData,
    qr: qrCodeData,
    info: clientInfo
  });
});

app.get('/api/whatsapp/messages', async (req, res) => {
  if (!isReady) {
    return res.status(401).json({ error: 'WhatsApp client is not ready. Please scan QR.' });
  }

  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Fetch chats (recent conversations)
    const chats = await client.getChats();
    const recentChats = chats.slice(0, limit);
    
    const messages = [];

    // Fetch the latest message for each recent chat
    for (const chat of recentChats) {
      const chatMessages = await chat.fetchMessages({ limit: 1 });
      if (chatMessages.length > 0) {
        const msg = chatMessages[0];
        const contact = await msg.getContact();
        
        messages.push({
          id: msg.id._serialized,
          source: 'WhatsApp',
          sender: chat.isGroup ? chat.name : contact.pushname || contact.name || contact.number,
          senderPhone: contact.number,
          subject: chat.name, // Use chat name as subject
          preview: msg.hasMedia ? '[Media Message]' : msg.body.substring(0, 100),
          time: formatTime(msg.timestamp * 1000),
          timestamp: msg.timestamp * 1000,
          isRead: true, // We don't mark as unread to avoid clutter unless we query it specifically
          isStarred: msg.isStarred,
          threadId: chat.id._serialized
        });
      }
    }

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

app.listen(port, () => {
  console.log(`CHATR Backend API listening at http://localhost:${port}`);
});
