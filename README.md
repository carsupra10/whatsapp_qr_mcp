# WhatsApp MCP Server

A Model Context Protocol (MCP) server for WhatsApp integration with QR-based authentication, message queue management, and rate limiting. Perfect for deploying on Vercel and integrating with ChatGPT and Claude.

## Features

✨ **Core Features:**
- 📱 QR Code Authentication (no API key needed)
- 📨 Send and receive WhatsApp messages
- 🔄 Message queue system with rate limiting
- ⏱️ Time-based message scheduling
- 🚫 Anti-blocking protection
- 📊 Message analytics and tracking
- 👔 Business profile management
- 📇 Contact management

✨ **Technical Features:**
- 🎯 MCP protocol support (Claude Desktop, ChatGPT)
- ☁️ Vercel-ready deployment
- 💾 JSON-based queue persistence (lowdb)
- 🔁 Automatic retry with exponential backoff
- 📈 Real-time queue status monitoring

## Architecture

```
┌─────────────────┐
│  Claude/ChatGPT │
│   (MCP Client)  │
└────────┬────────┘
         │ MCP Protocol
         ↓
┌─────────────────┐
│   MCP Server    │
│  - Tool Router  │
│  - Validation   │
└────────┬────────┘
         │
    ┌────┴─────┐
    ↓          ↓
┌────────┐  ┌──────────┐
│WhatsApp│  │  Queue   │
│ Client │  │  Manager │
└────────┘  └──────────┘
    ↓           ↓
┌────────┐  ┌──────────┐
│  QR    │  │   JSON   │
│  Auth  │  │    DB    │
└────────┘  └──────────┘
```

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Chrome/Chromium (for WhatsApp Web automation)

### Local Setup

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Create environment file:**

```bash
cp .env.example .env
```

3. **Build the project:**

```bash
npm run build
```

4. **Run in development mode:**

```bash
npm run dev
```

5. **Authenticate with WhatsApp:**
   - When you first run the server, it will generate a QR code
   - Use the `get_auth_status` tool to retrieve the QR code
   - Scan it with your WhatsApp mobile app
   - The session will be saved for future use

## Configuration

Edit `.env` or set environment variables:

```env
# Session storage path
SESSION_PATH=./.wwebjs_auth

# Queue database path
QUEUE_DB_PATH=./queue.json

# Queue configuration
MIN_DELAY=5000          # Minimum delay between messages (ms)
MAX_DELAY=15000         # Maximum delay between messages (ms)
MAX_RETRIES=3           # Maximum retry attempts
MESSAGES_PER_MINUTE=10  # Rate limit
```

### Anti-Blocking Strategy

The server implements several strategies to prevent WhatsApp from blocking your account:

1. **Random Delays:** Messages are sent with random delays between MIN_DELAY and MAX_DELAY
2. **Rate Limiting:** Maximum MESSAGES_PER_MINUTE enforced
3. **Queue System:** Messages are queued and sent gradually
4. **Retry Logic:** Failed messages retry with exponential backoff
5. **Human-like Behavior:** Randomization mimics human sending patterns

## Available Tools

### 1. `get_auth_status`
Get WhatsApp authentication status and QR code.

```json
{}
```

**Returns:** Authentication status, QR code data URL if pending

### 2. `send_message`
Send a WhatsApp message (queued by default).

```json
{
  "number": "+1234567890",
  "message": "Hello from MCP!",
  "immediate": false
}
```

- `immediate: false` (default) - Message added to queue
- `immediate: true` - Send immediately, bypass queue

### 3. `read_messages`
Read messages from a specific chat.

```json
{
  "chatId": "1234567890@c.us",
  "limit": 50
}
```

### 4. `get_chats`
Get list of recent chats.

```json
{
  "limit": 20
}
```

### 5. `get_contacts`
Get all WhatsApp contacts.

```json
{}
```

### 6. `get_business_profile`
Get business profile information for a contact.

```json
{
  "contactId": "1234567890@c.us"
}
```

### 7. `get_my_profile`
Get your own WhatsApp profile information.

```json
{}
```

### 8. `get_queue_status`
Get message queue status.

```json
{}
```

**Returns:** Counts of pending, sent, and failed messages

### 9. `get_analytics`
Get message analytics for past N days.

```json
{
  "days": 7
}
```

## Vercel Deployment

### Option 1: Vercel CLI

1. **Install Vercel CLI:**

```bash
npm i -g vercel
```

2. **Login to Vercel:**

```bash
vercel login
```

3. **Deploy:**

```bash
vercel
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. Deploy!

### Environment Variables on Vercel

Set these in Vercel dashboard or via CLI:

```bash
vercel env add SESSION_PATH
# Value: /tmp/.wwebjs_auth

vercel env add QUEUE_DB_PATH
# Value: /tmp/queue.json

vercel env add MIN_DELAY
# Value: 5000

vercel env add MAX_DELAY
# Value: 15000
```

### Important Notes for Vercel

⚠️ **Session Persistence:** Vercel serverless functions are stateless. WhatsApp sessions stored in `/tmp` will be lost between deployments. Consider:

1. **Use Vercel KV or external storage** for session persistence
2. **Re-authenticate after each deployment** (scan QR again)
3. **Use a dedicated VPS** if frequent re-authentication is problematic

⚠️ **Queue Database:** JSON storage in `/tmp` is ephemeral. For production:

1. Use Vercel Postgres or external database
2. Implement queue with Redis
3. Use a dedicated worker service

## Integrating with Claude Desktop

1. **Edit Claude Desktop config:**

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add MCP server:**

```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "node",
      "args": ["/absolute/path/to/whatsapp-mcp/dist/index.js"]
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Use the tools:** Ask Claude to check WhatsApp auth status, send messages, etc.

## Integrating with ChatGPT (Custom GPT)

Since ChatGPT doesn't natively support MCP, you'll need to:

1. **Deploy to Vercel** as described above
2. **Create API wrapper** (HTTP endpoints)
3. **Configure Custom GPT** to call your endpoints

Example API wrapper (add to your project):

```typescript
// api/whatsapp.ts
import { WhatsAppMCPServer } from '../src/server';

export default async function handler(req, res) {
  const server = new WhatsAppMCPServer();
  // Handle HTTP requests and route to MCP tools
  // Return JSON responses
}
```

## Usage Examples

### Example 1: Send a Message

```typescript
// In Claude Desktop
"Use the send_message tool to send 'Hello!' to +1234567890"
```

### Example 2: Check Queue Status

```typescript
"Use get_queue_status to see how many messages are pending"
```

### Example 3: Get Analytics

```typescript
"Use get_analytics to show message statistics for the last 30 days"
```

### Example 4: Bulk Sending (Queue Mode)

```typescript
// Queue multiple messages
"Send the following messages:
1. To +1111111111: 'Message 1'
2. To +2222222222: 'Message 2'
3. To +3333333333: 'Message 3'
Use the queue to prevent blocking"
```

## Troubleshooting

### QR Code Not Generating

- Check if Chrome/Chromium is installed
- Verify SESSION_PATH is writable
- Check logs for errors

### Messages Not Sending

- Verify WhatsApp is authenticated (`get_auth_status`)
- Check queue status (`get_queue_status`)
- Review analytics for failures (`get_analytics`)

### WhatsApp Blocks

If you get blocked:
- Increase MIN_DELAY and MAX_DELAY
- Decrease MESSAGES_PER_MINUTE
- Wait 24-48 hours before resuming
- Use multiple accounts for high volume

### Vercel Deployment Issues

- Increase maxLambdaSize in `vercel.json`
- Check function logs in Vercel dashboard
- Verify environment variables are set

## Rate Limits & Best Practices

### Recommended Limits

- **Personal Account:** 10-15 messages/minute
- **Business Account:** 20-30 messages/minute
- **Verified Business:** Up to 50 messages/minute

### Best Practices

1. ✅ Always use queue mode for bulk sending
2. ✅ Monitor analytics regularly
3. ✅ Start with conservative limits
4. ✅ Gradually increase if no issues
5. ✅ Use business accounts for higher volume
6. ❌ Don't send spam or unsolicited messages
7. ❌ Don't send to numbers that haven't opted in
8. ❌ Don't use for illegal activities

## Security Considerations

- 🔒 Keep your session files secure
- 🔒 Don't share your authentication data
- 🔒 Use environment variables for sensitive config
- 🔒 Regularly backup your queue database
- 🔒 Monitor for unauthorized access

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues, questions, or feature requests, please open a GitHub issue.

---

**Built with ❤️ using:**
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)
- [Lowdb](https://github.com/typicode/lowdb)
