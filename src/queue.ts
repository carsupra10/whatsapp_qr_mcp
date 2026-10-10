import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { EventEmitter } from 'events';
import { join } from 'path';

export interface QueuedMessage {
  id: number;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: number;
  scheduledFor: number;
  attempts: number;
  error?: string;
}

export interface AnalyticsEntry {
  date: string;
  sent: number;
  failed: number;
  pending: number;
}

interface DatabaseSchema {
  messages: QueuedMessage[];
  analytics: AnalyticsEntry[];
  nextId: number;
}

export interface QueueConfig {
  minDelay: number; // Minimum delay between messages (ms)
  maxDelay: number; // Maximum delay between messages (ms)
  maxRetries: number;
  messagesPerMinute: number;
}

export class MessageQueue extends EventEmitter {
  private db: Low<DatabaseSchema>;
  private processing = false;
  private config: QueueConfig;
  private lastSentTime = 0;
  private initialized = false;

  constructor(dbPath: string, config?: Partial<QueueConfig>) {
    super();
    const adapter = new JSONFile<DatabaseSchema>(dbPath);
    this.db = new Low(adapter, {
      messages: [],
      analytics: [],
      nextId: 1,
    });
    this.config = {
      minDelay: 5000, // 5 seconds
      maxDelay: 15000, // 15 seconds
      maxRetries: 3,
      messagesPerMinute: 10,
      ...config,
    };
  }

  async initialize() {
    await this.db.read();
    if (!this.db.data) {
      this.db.data = {
        messages: [],
        analytics: [],
        nextId: 1,
      };
      await this.db.write();
    }
    this.initialized = true;
  }

  async enqueue(recipient: string, message: string): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    const now = Date.now();
    const delay = this.getRandomDelay();
    const scheduledFor = Math.max(now, this.lastSentTime + delay);

    const messageId = this.db.data!.nextId++;
    const queuedMessage: QueuedMessage = {
      id: messageId,
      recipient,
      message,
      status: 'pending',
      createdAt: now,
      scheduledFor,
      attempts: 0,
    };

    this.db.data!.messages.push(queuedMessage);
    await this.db.write();

    this.emit('queued', { messageId, recipient, scheduledFor });

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }

    return messageId;
  }

  private getRandomDelay(): number {
    const { minDelay, maxDelay } = this.config;
    return Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
  }

  private async startProcessing() {
    if (this.processing) return;
    this.processing = true;

    while (this.processing) {
      const message = await this.getNextMessage();

      if (!message) {
        // No messages to process, check again in 5 seconds
        await this.sleep(5000);
        continue;
      }

      const now = Date.now();
      const timeToWait = message.scheduledFor - now;

      if (timeToWait > 0) {
        await this.sleep(timeToWait);
      }

      // Emit message for sending
      this.emit('process', message);

      // Wait for rate limiting
      await this.sleep(this.getRandomDelay());
    }
  }

  private async getNextMessage(): Promise<QueuedMessage | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const now = Date.now();
    const message = this.db.data!.messages.find(
      (m) => m.status === 'pending' && m.scheduledFor <= now
    );

    return message || null;
  }

  async markSent(messageId: number) {
    if (!this.initialized) {
      await this.initialize();
    }

    const message = this.db.data!.messages.find((m) => m.id === messageId);
    if (message) {
      message.status = 'sent';
      await this.db.write();
      this.lastSentTime = Date.now();
      await this.updateAnalytics('sent');
      this.emit('sent', messageId);
    }
  }

  async markFailed(messageId: number, error: string) {
    if (!this.initialized) {
      await this.initialize();
    }

    const message = this.db.data!.messages.find((m) => m.id === messageId);
    if (!message) return;

    if (message.attempts < this.config.maxRetries) {
      // Retry with exponential backoff
      const backoff = Math.pow(2, message.attempts) * 60000; // minutes
      message.attempts++;
      message.scheduledFor = Date.now() + backoff;
      message.error = error;
      await this.db.write();
      this.emit('retry', { messageId, attempt: message.attempts });
    } else {
      message.status = 'failed';
      message.error = error;
      await this.db.write();
      await this.updateAnalytics('failed');
      this.emit('failed', { messageId, error });
    }
  }

  async getMessage(messageId: number): Promise<QueuedMessage | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.db.data!.messages.find((m) => m.id === messageId) || null;
  }

  async getQueueStatus() {
    if (!this.initialized) {
      await this.initialize();
    }

    const statusCounts: { [key: string]: number } = {};

    for (const message of this.db.data!.messages) {
      statusCounts[message.status] = (statusCounts[message.status] || 0) + 1;
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }

  private async updateAnalytics(type: 'sent' | 'failed' | 'pending') {
    if (!this.initialized) {
      await this.initialize();
    }

    const today = new Date().toISOString().split('T')[0];
    let entry = this.db.data!.analytics.find((a) => a.date === today);

    if (!entry) {
      entry = {
        date: today,
        sent: 0,
        failed: 0,
        pending: 0,
      };
      this.db.data!.analytics.push(entry);
    }

    entry[type]++;
    await this.db.write();
  }

  async getAnalytics(days: number = 7) {
    if (!this.initialized) {
      await this.initialize();
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return this.db.data!.analytics
      .filter((a) => a.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  stopProcessing() {
    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async close() {
    this.stopProcessing();
    await this.db.write();
  }
}
