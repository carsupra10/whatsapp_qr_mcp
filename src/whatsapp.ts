import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { EventEmitter } from 'events';

export interface WhatsAppConfig {
  sessionPath?: string;
  puppeteerArgs?: string[];
}

export interface Contact {
  id: string;
  name: string;
  number: string;
  isGroup: boolean;
  isBusiness: boolean;
}

export interface BusinessProfile {
  description?: string;
  email?: string;
  website?: string;
  category?: string;
  address?: string;
}

export class WhatsAppClient extends EventEmitter {
  private client: Client;
  private ready = false;
  private qrCode: string | null = null;
  private authStatus: 'pending' | 'qr_ready' | 'authenticated' | 'failed' = 'pending';

  constructor(config?: WhatsAppConfig) {
    super();
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config?.sessionPath || './.wwebjs_auth',
      }),
      puppeteer: {
        headless: true,
        args: config?.puppeteerArgs || [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('QR Code received');
      this.qrCode = await qrcode.toDataURL(qr);
      this.authStatus = 'qr_ready';
      this.emit('qr', { qr, dataUrl: this.qrCode });
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp authenticated');
      this.authStatus = 'authenticated';
      this.emit('authenticated');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready');
      this.ready = true;
      this.emit('ready');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failure:', msg);
      this.authStatus = 'failed';
      this.emit('auth_failure', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp disconnected:', reason);
      this.ready = false;
      this.emit('disconnected', reason);
    });

    this.client.on('message', (message) => {
      this.emit('message', message);
    });
  }

  async initialize(): Promise<void> {
    await this.client.initialize();
  }

  isReady(): boolean {
    return this.ready;
  }

  getAuthStatus() {
    return {
      status: this.authStatus,
      qrCode: this.qrCode,
      ready: this.ready,
    };
  }

  async sendMessage(number: string, message: string): Promise<void> {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    // Format number (remove special characters, add country code if missing)
    const formattedNumber = this.formatPhoneNumber(number);
    const chatId = `${formattedNumber}@c.us`;

    try {
      await this.client.sendMessage(chatId, message);
      this.emit('message_sent', { number, message });
    } catch (error) {
      this.emit('message_failed', { number, message, error });
      throw error;
    }
  }

  private formatPhoneNumber(number: string): string {
    // Remove all non-numeric characters
    let cleaned = number.replace(/\D/g, '');
    
    // If doesn't start with country code, you might want to add default
    // This is a simple example - adjust based on your needs
    if (!cleaned.startsWith('1') && !cleaned.startsWith('91') && cleaned.length === 10) {
      // Default to some country code if needed
      // cleaned = '1' + cleaned; // Example: US
    }
    
    return cleaned;
  }

  async getMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const chat = await this.client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });
    return messages;
  }

  async getChats(limit: number = 20) {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const chats = await this.client.getChats();
    return chats.slice(0, limit).map((chat) => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      lastMessage: chat.lastMessage?.body,
      timestamp: chat.timestamp,
    }));
  }

  async getContacts(): Promise<Contact[]> {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const contacts = await this.client.getContacts();
    return contacts.map((contact) => ({
      id: contact.id._serialized,
      name: contact.name || contact.pushname || '',
      number: contact.number,
      isGroup: contact.isGroup,
      isBusiness: contact.isBusiness,
    }));
  }

  async getBusinessProfile(contactId: string): Promise<BusinessProfile | null> {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const contact = await this.client.getContactById(contactId);
      if (!contact.isBusiness) {
        return null;
      }

      // Try to get business profile - the API may vary by version
      // Some versions use getBusinessProfile, others don't expose it
      const businessProfile = (contact as any).getBusinessProfile 
        ? await (contact as any).getBusinessProfile()
        : null;

      if (!businessProfile) {
        return {
          description: 'Business profile not available',
        };
      }

      return {
        description: businessProfile.description,
        email: businessProfile.email,
        website: businessProfile.website?.[0],
        category: businessProfile.category,
        address: businessProfile.address,
      };
    } catch (error) {
      console.error('Error fetching business profile:', error);
      return null;
    }
  }

  async setStatus(status: string): Promise<void> {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const state = await this.client.getState();
    // Note: Status update might not be directly supported in whatsapp-web.js
    // This is a placeholder for the interface
    console.log('Current state:', state);
  }

  async getMyProfile() {
    if (!this.ready) {
      throw new Error('WhatsApp client is not ready');
    }

    const contact = await this.client.getContactById(
      (await this.client.info).wid._serialized
    );
    
    return {
      name: contact.name || contact.pushname,
      number: contact.number,
      isBusiness: contact.isBusiness,
      profilePicUrl: await contact.getProfilePicUrl(),
    };
  }

  async logout(): Promise<void> {
    await this.client.logout();
    this.ready = false;
    this.authStatus = 'pending';
    this.qrCode = null;
  }

  async destroy(): Promise<void> {
    await this.client.destroy();
    this.ready = false;
  }
}
