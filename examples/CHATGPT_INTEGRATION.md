# ChatGPT Custom GPT Integration Guide

Since ChatGPT doesn't natively support the Model Context Protocol (MCP), you'll need to create an HTTP API wrapper. Here's how:

## Step 1: Deploy HTTP API

We provide an example HTTP API wrapper in `examples/http-api.ts`.

### Option A: Deploy on Vercel

1. **Create `api/index.ts`:**
```typescript
import app from '../examples/http-api.js';

export default app;
```

2. **Update `vercel.json`:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

3. **Deploy:**
```bash
vercel --prod
```

### Option B: Deploy on your own server

1. **Build the HTTP API:**
```bash
npm run build
node dist/examples/http-api.js
```

2. **Or use the example directly:**
```bash
npx tsx examples/http-api.ts
```

3. **Make it accessible:**
   - Use a reverse proxy (nginx)
   - Set up SSL certificate
   - Configure firewall

## Step 2: Create OpenAPI Spec

ChatGPT Custom GPTs use OpenAPI specifications. Here's a spec for your WhatsApp API:

```yaml
openapi: 3.0.0
info:
  title: WhatsApp MCP API
  version: 1.0.0
  description: Send and manage WhatsApp messages

servers:
  - url: https://your-deployment.vercel.app
    description: Production server

paths:
  /api/auth/status:
    get:
      summary: Get WhatsApp authentication status
      operationId: getAuthStatus
      responses:
        '200':
          description: Authentication status
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ready:
                    type: boolean
                  qrCode:
                    type: string

  /api/messages/send:
    post:
      summary: Send a WhatsApp message
      operationId: sendMessage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - number
                - message
              properties:
                number:
                  type: string
                  description: Phone number with country code
                  example: "+1234567890"
                message:
                  type: string
                  description: Message to send
                  example: "Hello from ChatGPT!"
                immediate:
                  type: boolean
                  description: Send immediately or queue
                  default: false
      responses:
        '200':
          description: Message sent or queued
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  messageId:
                    type: number
                  message:
                    type: string

  /api/chats:
    get:
      summary: Get recent chats
      operationId: getChats
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: List of chats
          content:
            application/json:
              schema:
                type: object
                properties:
                  chats:
                    type: array
                    items:
                      type: object

  /api/queue/status:
    get:
      summary: Get message queue status
      operationId: getQueueStatus
      responses:
        '200':
          description: Queue status
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: array
                    items:
                      type: object

  /api/analytics:
    get:
      summary: Get message analytics
      operationId: getAnalytics
      parameters:
        - name: days
          in: query
          schema:
            type: integer
            default: 7
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                type: object
```

Save this as `openapi.yaml` and host it somewhere accessible.

## Step 3: Create Custom GPT

1. **Go to ChatGPT:**
   - Navigate to https://chat.openai.com
   - Click your profile → "My GPTs"
   - Click "Create a GPT"

2. **Configure GPT:**

**Name:** WhatsApp Assistant

**Description:** 
```
I help you send and manage WhatsApp messages. I can:
- Send messages (queued or immediate)
- Check your chats
- View message analytics
- Check queue status
- Get contact information
```

**Instructions:**
```
You are a WhatsApp messaging assistant. You help users send and manage WhatsApp messages through a secure API.

When sending messages:
1. By default, use queued sending to prevent blocking
2. Only send immediately if the user explicitly asks for urgent/immediate delivery
3. Always confirm the phone number includes the country code (e.g., +1234567890)

When checking status:
1. First check auth status if user hasn't authenticated
2. Provide clear instructions for QR code scanning if needed

Best practices:
1. Warn users about rate limits
2. Suggest queued sending for bulk messages
3. Monitor queue status for bulk operations
4. Be helpful with formatting phone numbers
```

**Conversation starters:**
- "Send a WhatsApp message"
- "Check my WhatsApp auth status"
- "Show my message queue"
- "Get WhatsApp analytics"

3. **Configure Actions:**

Click "Create new action" and:
- **Authentication:** None (or add API key if you implement it)
- **Schema:** Paste your OpenAPI spec or provide the URL
- **Privacy policy:** Add your privacy policy URL

4. **Test:**

Try these commands:
- "Send 'Hello!' to +1234567890"
- "Check my WhatsApp status"
- "Show me the queue"

## Step 4: Add Authentication (Optional but Recommended)

### Add API Key Authentication

1. **Update your HTTP API:**
```typescript
const API_KEY = process.env.API_KEY || 'your-secret-key';

app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

2. **Update OpenAPI spec:**
```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - ApiKeyAuth: []
```

3. **In Custom GPT settings:**
   - Authentication: API Key
   - Auth Type: Custom
   - Custom Header Name: X-API-Key
   - API Key: [your-secret-key]

## Step 5: Publish (Optional)

1. In Custom GPT settings, choose:
   - **Only me** - Private use
   - **Anyone with link** - Share with specific people
   - **Public** - Listed in GPT store (requires verification)

## Example Usage in ChatGPT

**User:** "Send 'Hello from ChatGPT!' to +1234567890"

**GPT:** "I'll send that message via WhatsApp. Let me queue it to prevent rate limiting."
[Calls API]
"Message queued successfully! Message ID: 123. It will be sent within the next 5-15 seconds based on rate limiting."

**User:** "Check the queue status"

**GPT:** [Calls API]
"Current queue status:
- Pending: 5 messages
- Sent: 142 messages
- Failed: 2 messages"

## Advanced: Add Webhooks

To receive incoming messages in ChatGPT, you'll need:

1. **Webhook endpoint in your API:**
```typescript
const webhookUrl = process.env.WEBHOOK_URL;

whatsapp.on('message', async (message) => {
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
      }),
    });
  }
});
```

2. **Configure webhook in GPT settings**

## Troubleshooting

### GPT can't reach your API
- Check your deployment URL is correct
- Verify CORS is enabled
- Check Vercel logs for errors

### Authentication fails
- Verify API key is correct
- Check header name matches
- Test with curl first

### Messages not sending
- Check WhatsApp auth status endpoint
- Verify queue is processing
- Check analytics for errors

## Security Best Practices

1. **Always use HTTPS**
2. **Implement API key authentication**
3. **Rate limit your endpoints**
4. **Log all requests**
5. **Don't expose session files**
6. **Validate all inputs**
7. **Set up monitoring**

## Example curl Commands

Test your API before integrating:

```bash
# Check auth status
curl https://your-api.vercel.app/api/auth/status

# Send message
curl -X POST https://your-api.vercel.app/api/messages/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{"number": "+1234567890", "message": "Hello!"}'

# Get queue status
curl https://your-api.vercel.app/api/queue/status \
  -H "X-API-Key: your-key"
```

---

Now you have a fully functional WhatsApp assistant in ChatGPT! 🎉
