# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install & Build
```bash
npm install
npm run build
```

### Step 2: Run the Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Step 3: Authenticate with WhatsApp
The server will start and wait for authentication. To get the QR code, use the MCP client (Claude Desktop) to call the `get_auth_status` tool, then scan the QR code with your WhatsApp mobile app.

## 🔧 Configuration

Copy `.env.example` to `.env` and adjust:
```bash
cp .env.example .env
```

Key settings:
- `MIN_DELAY=5000` - Minimum delay between messages (5 seconds)
- `MAX_DELAY=15000` - Maximum delay between messages (15 seconds)
- `MESSAGES_PER_MINUTE=10` - Rate limit

## 🎯 Using with Claude Desktop

1. Add to `claude_desktop_config.json`:
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

2. Restart Claude Desktop

3. Ask Claude: "Check WhatsApp authentication status"

4. If QR code is shown, scan it with your phone

5. Start sending messages!

## 📱 Example Usage in Claude

### Get Auth Status
```
"Check my WhatsApp authentication status"
```

### Send a Message (Queued)
```
"Send 'Hello!' to +1234567890 via WhatsApp using the queue"
```

### Send Immediate
```
"Send 'Urgent message' to +1234567890 immediately via WhatsApp"
```

### Check Queue
```
"Show me the WhatsApp message queue status"
```

### Get Analytics
```
"Show WhatsApp message analytics for the last 7 days"
```

## ☁️ Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add SESSION_PATH
# Enter: /tmp/.wwebjs_auth

vercel env add QUEUE_DB_PATH
# Enter: /tmp/queue.json
```

⚠️ **Note:** You'll need to re-authenticate after each deployment since Vercel functions are stateless.

## 🔍 Troubleshooting

### QR Code Not Showing
- Check if Chrome is installed: `which google-chrome`
- Try running with: `NODE_ENV=development npm run dev`
- Check logs for errors

### Messages Not Sending
1. Verify authentication: `get_auth_status`
2. Check queue: `get_queue_status`
3. Review analytics: `get_analytics`

### Rate Limited / Blocked
- Increase delays in `.env`
- Decrease `MESSAGES_PER_MINUTE`
- Wait 24-48 hours before resuming

## 📚 Available MCP Tools

1. **get_auth_status** - Check authentication and get QR code
2. **send_message** - Send a message (queued or immediate)
3. **read_messages** - Read messages from a chat
4. **get_chats** - List recent chats
5. **get_contacts** - Get all contacts
6. **get_business_profile** - Get business profile info
7. **get_my_profile** - Get your own profile
8. **get_queue_status** - Check message queue
9. **get_analytics** - View message statistics

## 🆘 Need Help?

- Check the full [README.md](./README.md)
- Open an issue on GitHub
- Review logs in the terminal

---

Happy messaging! 📲
