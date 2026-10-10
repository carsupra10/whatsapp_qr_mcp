# Project Structure

```
whatsapp-mcp/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server.ts             # MCP server implementation
│   ├── whatsapp.ts           # WhatsApp client wrapper
│   └── queue.ts              # Message queue manager
│
├── dist/                     # Compiled JavaScript (generated)
│
├── examples/
│   ├── http-api.ts           # HTTP API wrapper for ChatGPT
│   └── CHATGPT_INTEGRATION.md # ChatGPT integration guide
│
├── scripts/
│   └── post-build.js         # Post-build script
│
├── Configuration Files
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vercel.json               # Vercel deployment config
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── Dockerfile                # Docker container definition
├── docker-compose.yml        # Docker Compose configuration
├── .dockerignore             # Docker ignore rules
│
├── Documentation
├── README.md                 # Main documentation
├── QUICKSTART.md             # Quick start guide
├── DEPLOYMENT.md             # Deployment guide
└── claude_desktop_config.example.json # Claude Desktop config
```

## Key Components

### 1. MCP Server (`src/server.ts`)
- Implements Model Context Protocol
- Defines 9 tools for WhatsApp operations
- Handles tool execution and error handling
- Manages WhatsApp client and queue lifecycle

### 2. WhatsApp Client (`src/whatsapp.ts`)
- QR code authentication
- Session persistence
- Message sending and receiving
- Contact management
- Business profile retrieval
- Event handling

### 3. Message Queue (`src/queue.ts`)
- JSON-based storage (lowdb)
- Rate limiting and delays
- Automatic retry with exponential backoff
- Analytics tracking
- Queue status monitoring

### 4. Main Entry (`src/index.ts`)
- Server initialization
- Graceful shutdown handling
- Error handling

## Available Scripts

```bash
npm install          # Install dependencies
npm run build        # Build TypeScript
npm run dev          # Development mode with auto-reload
npm start            # Start production server
npm run type-check   # Check TypeScript types
```

## Environment Variables

```env
SESSION_PATH         # WhatsApp session storage path
QUEUE_DB_PATH        # Queue database path
MIN_DELAY            # Minimum delay between messages (ms)
MAX_DELAY            # Maximum delay between messages (ms)
MAX_RETRIES          # Maximum retry attempts
MESSAGES_PER_MINUTE  # Rate limit
```

## MCP Tools

1. **get_auth_status** - Get authentication status and QR code
2. **send_message** - Send a message (queued or immediate)
3. **read_messages** - Read messages from a chat
4. **get_chats** - List recent chats
5. **get_contacts** - Get all contacts
6. **get_business_profile** - Get business profile info
7. **get_my_profile** - Get your own profile
8. **get_queue_status** - Check message queue status
9. **get_analytics** - View message statistics

## Integration Options

### Claude Desktop
- Native MCP protocol support
- Configure via `claude_desktop_config.json`
- Direct tool access

### ChatGPT Custom GPT
- HTTP API wrapper required
- OpenAPI specification
- Custom GPT configuration

### Vercel
- Serverless deployment
- Quick setup
- Auto-scaling

### VPS
- Full control
- Persistent sessions
- Best for production

### Docker
- Containerized deployment
- Easy scaling
- Portable

## Data Flow

```
User Request
    ↓
MCP/HTTP Interface
    ↓
Server Router
    ↓
WhatsApp Client / Queue Manager
    ↓
WhatsApp Web API
    ↓
WhatsApp Servers
```

## Queue Flow

```
Message Added
    ↓
Queue (pending)
    ↓
Rate Limiter
    ↓
Send Attempt
    ↓
Success → Mark Sent
    ↓
Failure → Retry (max 3x) → Mark Failed
```

## Session Management

```
First Run
    ↓
Generate QR Code
    ↓
User Scans QR
    ↓
Session Saved (.wwebjs_auth/)
    ↓
Subsequent Runs → Auto-Login
```

## Best Practices

1. **Rate Limiting**
   - Use queue for bulk messages
   - Start with conservative limits
   - Monitor analytics

2. **Session Management**
   - Keep session files secure
   - Backup regularly
   - Don't commit to git

3. **Deployment**
   - Use environment variables
   - Enable HTTPS
   - Monitor logs

4. **Error Handling**
   - Check queue status
   - Review analytics
   - Monitor retry counts

## Security Considerations

- Session files contain auth tokens
- Never expose .wwebjs_auth directory
- Use API keys for HTTP endpoints
- Implement rate limiting
- Validate all inputs
- Monitor for abuse

## Performance Tips

1. Adjust delays based on account type
2. Use queue for bulk operations
3. Monitor message success rates
4. Scale horizontally with multiple instances
5. Use Redis for distributed queues

## Troubleshooting

### QR Code Issues
- Check Chrome installation
- Verify SESSION_PATH is writable
- Review logs

### Messages Not Sending
- Verify authentication
- Check queue status
- Review analytics

### Rate Limiting
- Increase delays
- Reduce messages per minute
- Monitor for blocks

## Development

```bash
# Install dependencies
npm install

# Run in dev mode (auto-reload)
npm run dev

# Type checking
npm run type-check

# Build
npm run build
```

## Testing

```bash
# Start server
npm start

# In another terminal, test with Claude Desktop
# Or use curl to test HTTP endpoints

# Check logs
tail -f logs/app.log
```

## Monitoring

Track these metrics:
- Messages sent/failed
- Queue length
- Authentication status
- Response times
- Error rates

## Scaling

### Horizontal
- Multiple instances with separate WhatsApp accounts
- Load balancer
- Shared Redis queue

### Vertical
- Increase server resources
- Optimize delays
- Batch operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT - See LICENSE file for details

## Support

- GitHub Issues
- Documentation
- Community Discord (if available)

---

Built with ❤️ for the MCP community
