// Example HTTP wrapper for ChatGPT Custom GPT integration
// This is a simple example - you'll need to adapt it to your needs

import express from 'express';
import { WhatsAppClient } from './whatsapp.js';
import { MessageQueue } from './queue.js';

const app = express();
app.use(express.json());

const whatsapp = new WhatsAppClient();
const queue = new MessageQueue('./queue.json');

// Initialize
(async () => {
  await queue.initialize();
  await whatsapp.initialize();
  console.log('WhatsApp HTTP API ready');
})();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ready: whatsapp.isReady() });
});

// Get auth status
app.get('/api/auth/status', (req, res) => {
  const status = whatsapp.getAuthStatus();
  res.json(status);
});

// Send message
app.post('/api/messages/send', async (req, res) => {
  try {
    const { number, message, immediate = false } = req.body;

    if (!number || !message) {
      return res.status(400).json({ error: 'number and message required' });
    }

    if (immediate) {
      await whatsapp.sendMessage(number, message);
      res.json({ success: true, message: 'Sent immediately' });
    } else {
      const messageId = await queue.enqueue(number, message);
      res.json({ success: true, messageId, message: 'Queued' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chats
app.get('/api/chats', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const chats = await whatsapp.getChats(limit);
    res.json({ chats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await whatsapp.getContacts();
    res.json({ contacts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Read messages
app.get('/api/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const messages = await whatsapp.getMessages(chatId, limit);
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get queue status
app.get('/api/queue/status', async (req, res) => {
  try {
    const status = await queue.getQueueStatus();
    res.json({ status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const analytics = await queue.getAnalytics(days);
    res.json({ analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get business profile
app.get('/api/business/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const profile = await whatsapp.getBusinessProfile(contactId);
    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get my profile
app.get('/api/profile/me', async (req, res) => {
  try {
    const profile = await whatsapp.getMyProfile();
    res.json({ profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP API listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await queue.close();
  await whatsapp.destroy();
  process.exit(0);
});

export default app;
