# Vercel Deployment Guide

## ⚠️ Important: Vercel Limitations

**Vercel is NOT recommended for production WhatsApp usage** because:

1. **Stateless Functions** - Sessions are lost on each deployment
2. **Ephemeral Storage** - `/tmp` is cleared between invocations
3. **Re-authentication Required** - Must scan QR code after every deployment
4. **Cold Starts** - Functions may take 10+ seconds to start
5. **No Background Processes** - Queue processing is limited

**Recommended for:**
- ✅ Demo/Testing purposes
- ✅ API documentation
- ✅ Understanding the architecture

**NOT recommended for:**
- ❌ Production message sending
- ❌ Bulk messaging operations
- ❌ Persistent WhatsApp sessions

## 🌐 Current Deployment

Your deployment at **https://whatsappqrmcp.vercel.app** is now showing:

- **Home Page**: Project information and API documentation
- **Health Check**: `/api/health` - Service status
- **API Endpoints**: Coming soon (requires WhatsApp session)

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Already Done)

```bash
# You've already deployed!
# Visit: https://whatsappqrmcp.vercel.app
```

### Option 2: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import `theaathish/whatsapp_qr_mcp`
4. Deploy!

## 🔧 Environment Variables

Set these in Vercel Dashboard:

```env
SESSION_PATH=/tmp/.wwebjs_auth
QUEUE_DB_PATH=/tmp/queue.json
MIN_DELAY=5000
MAX_DELAY=15000
MAX_RETRIES=3
MESSAGES_PER_MINUTE=10
NODE_ENV=production
```

## 📡 Available Endpoints

### GET `/`
Home page with API documentation

```bash
curl https://whatsappqrmcp.vercel.app/
```

### GET `/api/health`
Health check endpoint

```bash
curl https://whatsappqrmcp.vercel.app/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "WhatsApp MCP Server",
  "version": "1.0.0",
  "features": {
    "qrAuth": true,
    "messageQueue": true,
    "rateLimiting": true,
    "analytics": true,
    "mcpProtocol": true,
    "httpApi": true
  },
  "note": "This instance is stateless..."
}
```

## 🎯 Recommended Production Setup

### Use VPS Instead

For production WhatsApp messaging, deploy to a VPS:

**DigitalOcean / Linode / AWS EC2:**

```bash
# SSH into your server
ssh user@your-server.com

# Clone the repo
git clone https://github.com/theaathish/whatsapp_qr_mcp.git
cd whatsapp_qr_mcp

# Install dependencies
npm install

# Build
npm run build

# Run with PM2
pm2 start dist/index.js --name whatsapp-mcp
pm2 save
```

**Benefits:**
- ✅ Persistent sessions
- ✅ No re-authentication
- ✅ Background queue processing
- ✅ No cold starts
- ✅ Full control

**Cost:** ~$5-10/month

### Or Use Railway.app

Railway provides persistent storage with easy deployment:

1. Push to GitHub
2. Connect Railway to your repo
3. Deploy!
4. Railway handles the rest

**Better than Vercel for this use case:**
- ✅ Persistent disk storage
- ✅ Always-on processes
- ✅ No cold starts

## 🔄 How to Update Deployment

### Update Vercel

```bash
# Make changes
git add .
git commit -m "Update"
git push origin main

# Vercel auto-deploys from GitHub
# Or manually:
vercel --prod
```

## 📊 Monitoring Your Vercel Deployment

### View Logs

```bash
vercel logs
```

### Check Deployment Status

```bash
vercel ls
```

### View Functions

Visit Vercel Dashboard → Your Project → Functions

## 🛠 Troubleshooting

### 404 Errors

Fixed! The homepage now shows project info.

### Function Timeout

Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Session Lost

This is expected on Vercel. Solutions:
1. Use external session storage (Redis, S3)
2. Deploy to VPS instead
3. Accept re-authentication after deploys

### Cold Starts

First request may be slow (10+ seconds). This is normal for serverless.

## 🎯 Best Practices for Vercel

1. **Use for API Documentation** - Show what the API can do
2. **Demo Mode** - Let users see the interface
3. **Development** - Quick testing of changes
4. **Redirect to VPS** - For actual message sending

## 🔗 Related Links

- **Deployment URL**: https://whatsappqrmcp.vercel.app
- **GitHub**: https://github.com/theaathish/whatsapp_qr_mcp
- **Vercel Dashboard**: https://vercel.com/dashboard

## 💡 Recommendation

**For demonstration:** Keep Vercel deployment  
**For production:** Deploy to VPS or Railway

Your Vercel deployment is perfect for:
- Showing the API structure
- Documentation
- Testing endpoints
- Demo purposes

But for actual WhatsApp messaging, use a VPS with persistent storage!

## 📚 Next Steps

1. **Keep Vercel** for documentation/demo
2. **Deploy to VPS** for production use
3. **Use locally** with Claude Desktop for personal use

See `DEPLOYMENT.md` for detailed VPS setup instructions.

---

**Current Status:** ✅ Deployed to Vercel (demo mode)  
**Recommended:** 🚀 Deploy to VPS for production use
