import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { WhatsAppClient } from './whatsapp.js';
import { MessageQueue } from './queue.js';
import { z } from 'zod';

// Tool schemas
const SendMessageSchema = z.object({
  number: z.string().describe('Phone number with country code (e.g., +1234567890)'),
  message: z.string().describe('Message content to send'),
  immediate: z.boolean().optional().describe('Send immediately bypassing queue (default: false)'),
});

const ReadMessagesSchema = z.object({
  chatId: z.string().describe('Chat ID to read messages from'),
  limit: z.number().optional().describe('Number of messages to fetch (default: 50)'),
});

const GetChatsSchema = z.object({
  limit: z.number().optional().describe('Number of chats to fetch (default: 20)'),
});

const GetBusinessProfileSchema = z.object({
  contactId: z.string().describe('Contact ID to fetch business profile'),
});

const GetQueueStatusSchema = z.object({});

const GetAnalyticsSchema = z.object({
  days: z.number().optional().describe('Number of days to fetch analytics (default: 7)'),
});

export class WhatsAppMCPServer {
  private server: Server;
  private whatsapp: WhatsAppClient;
  private queue: MessageQueue;
  private qrCodeData: { qr: string; dataUrl: string } | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'whatsapp-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize WhatsApp and Queue
    this.whatsapp = new WhatsAppClient({
      sessionPath: process.env.SESSION_PATH || './.wwebjs_auth',
    });

    this.queue = new MessageQueue(
      process.env.QUEUE_DB_PATH || './queue.json',
      {
        minDelay: parseInt(process.env.MIN_DELAY || '5000'),
        maxDelay: parseInt(process.env.MAX_DELAY || '15000'),
        maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
        messagesPerMinute: parseInt(process.env.MESSAGES_PER_MINUTE || '10'),
      }
    );

    this.setupHandlers();
    this.setupWhatsAppHandlers();
    this.setupQueueHandlers();
  }

  private setupWhatsAppHandlers() {
    this.whatsapp.on('qr', (data) => {
      this.qrCodeData = data;
      console.log('QR Code generated. Use get_auth_status tool to retrieve it.');
    });

    this.whatsapp.on('ready', () => {
      console.log('WhatsApp is ready!');
      this.qrCodeData = null;
    });

    this.whatsapp.on('authenticated', () => {
      console.log('WhatsApp authenticated successfully');
    });

    this.whatsapp.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failed:', msg);
    });
  }

  private setupQueueHandlers() {
    this.queue.on('process', async (message) => {
      try {
        await this.whatsapp.sendMessage(message.recipient, message.message);
        this.queue.markSent(message.id);
      } catch (error) {
        this.queue.markFailed(
          message.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    });

    this.queue.on('queued', (data) => {
      console.log(`Message queued: ${data.messageId} for ${data.recipient}`);
    });

    this.queue.on('sent', (messageId) => {
      console.log(`Message sent: ${messageId}`);
    });

    this.queue.on('failed', (data) => {
      console.error(`Message failed: ${data.messageId} - ${data.error}`);
    });
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'get_auth_status',
          description:
            'Get WhatsApp authentication status and QR code if available. Scan the QR code with WhatsApp mobile app to authenticate.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'send_message',
          description:
            'Send a WhatsApp message. Messages are queued by default to prevent blocking. Use immediate flag to bypass queue.',
          inputSchema: {
            type: 'object',
            properties: {
              number: {
                type: 'string',
                description: 'Phone number with country code (e.g., +1234567890)',
              },
              message: {
                type: 'string',
                description: 'Message content to send',
              },
              immediate: {
                type: 'boolean',
                description: 'Send immediately bypassing queue (default: false)',
              },
            },
            required: ['number', 'message'],
          },
        },
        {
          name: 'read_messages',
          description: 'Read messages from a specific chat',
          inputSchema: {
            type: 'object',
            properties: {
              chatId: {
                type: 'string',
                description: 'Chat ID to read messages from',
              },
              limit: {
                type: 'number',
                description: 'Number of messages to fetch (default: 50)',
              },
            },
            required: ['chatId'],
          },
        },
        {
          name: 'get_chats',
          description: 'Get list of recent chats',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Number of chats to fetch (default: 20)',
              },
            },
          },
        },
        {
          name: 'get_contacts',
          description: 'Get all WhatsApp contacts',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_business_profile',
          description: 'Get business profile information for a contact',
          inputSchema: {
            type: 'object',
            properties: {
              contactId: {
                type: 'string',
                description: 'Contact ID to fetch business profile',
              },
            },
            required: ['contactId'],
          },
        },
        {
          name: 'get_my_profile',
          description: 'Get your own WhatsApp profile information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_queue_status',
          description: 'Get message queue status (pending, sent, failed counts)',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_analytics',
          description: 'Get message analytics for the past N days',
          inputSchema: {
            type: 'object',
            properties: {
              days: {
                type: 'number',
                description: 'Number of days to fetch analytics (default: 7)',
              },
            },
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_auth_status': {
            const status = this.whatsapp.getAuthStatus();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      status: status.status,
                      ready: status.ready,
                      qrCode: this.qrCodeData?.dataUrl || null,
                      message:
                        status.status === 'qr_ready'
                          ? 'Scan the QR code with WhatsApp mobile app'
                          : status.status === 'authenticated'
                          ? 'WhatsApp is authenticated'
                          : status.status === 'failed'
                          ? 'Authentication failed, please restart'
                          : 'Waiting for QR code...',
                    },
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'send_message': {
            const { number, message, immediate } = SendMessageSchema.parse(args);

            if (immediate) {
              await this.whatsapp.sendMessage(number, message);
              return {
                content: [
                  {
                    type: 'text',
                    text: `Message sent immediately to ${number}`,
                  },
                ],
              };
            } else {
              const messageId = await this.queue.enqueue(number, message);
              return {
                content: [
                  {
                    type: 'text',
                    text: `Message queued with ID: ${messageId}. It will be sent based on the queue schedule.`,
                  },
                ],
              };
            }
          }

          case 'read_messages': {
            const { chatId, limit } = ReadMessagesSchema.parse(args);
            const messages = await this.whatsapp.getMessages(chatId, limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    messages.map((m) => ({
                      from: m.from,
                      body: m.body,
                      timestamp: m.timestamp,
                      hasMedia: m.hasMedia,
                    })),
                    null,
                    2
                  ),
                },
              ],
            };
          }

          case 'get_chats': {
            const { limit } = GetChatsSchema.parse(args);
            const chats = await this.whatsapp.getChats(limit);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(chats, null, 2),
                },
              ],
            };
          }

          case 'get_contacts': {
            const contacts = await this.whatsapp.getContacts();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(contacts, null, 2),
                },
              ],
            };
          }

          case 'get_business_profile': {
            const { contactId } = GetBusinessProfileSchema.parse(args);
            const profile = await this.whatsapp.getBusinessProfile(contactId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(profile, null, 2),
                },
              ],
            };
          }

          case 'get_my_profile': {
            const profile = await this.whatsapp.getMyProfile();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(profile, null, 2),
                },
              ],
            };
          }

          case 'get_queue_status': {
            const status = this.queue.getQueueStatus();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(status, null, 2),
                },
              ],
            };
          }

          case 'get_analytics': {
            const { days } = GetAnalyticsSchema.parse(args);
            const analytics = this.queue.getAnalytics(days);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(analytics, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    // Initialize queue
    await this.queue.initialize();
    
    // Initialize WhatsApp
    console.log('Initializing WhatsApp client...');
    await this.whatsapp.initialize();

    // Start MCP server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('WhatsApp MCP Server running on stdio');
  }

  async stop() {
    this.queue.stopProcessing();
    await this.queue.close();
    await this.whatsapp.destroy();
  }
}
