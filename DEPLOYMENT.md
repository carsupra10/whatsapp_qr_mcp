# Deployment Guide

## 🚀 Deployment Options

### Option 1: Local Development
Best for: Testing, personal use, full control

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

**Pros:**
- ✅ Full control
- ✅ Persistent sessions
- ✅ No cold starts
- ✅ Easy debugging

**Cons:**
- ❌ Requires machine to stay on
- ❌ Manual management
- ❌ Local network only

---

### Option 2: Vercel Serverless
Best for: Quick deployment, scalability

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Configure Environment Variables:**
```bash
vercel env add SESSION_PATH
# /tmp/.wwebjs_auth

vercel env add QUEUE_DB_PATH
# /tmp/queue.json

vercel env add MIN_DELAY
# 5000

vercel env add MAX_DELAY
# 15000

vercel env add MAX_RETRIES
# 3

vercel env add MESSAGES_PER_MINUTE
# 10
```

**Pros:**
- ✅ Easy deployment
- ✅ Auto-scaling
- ✅ Global CDN

**Cons:**
- ⚠️ Ephemeral storage (re-auth needed after deploys)
- ⚠️ Cold starts
- ⚠️ 50MB function size limit

**Important Notes:**
- Sessions are lost on redeployment
- Need to re-scan QR code after each deploy
- Queue is lost on restart (use Redis for persistence)

---

### Option 3: VPS (Recommended for Production)
Best for: Production use, persistent sessions, high volume

**DigitalOcean Droplet / AWS EC2 / Linode:**

1. **Create a Ubuntu 22.04 server**

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install Chrome:**
```bash
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable
```

4. **Install dependencies:**
```bash
sudo apt-get install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

5. **Clone and setup:**
```bash
git clone <your-repo>
cd whatsapp-mcp
npm install
npm run build
```

6. **Setup PM2 for process management:**
```bash
sudo npm install -g pm2
pm2 start dist/index.js --name whatsapp-mcp
pm2 startup
pm2 save
```

7. **Configure environment:**
```bash
cp .env.example .env
nano .env
# Edit your configuration
```

**Pros:**
- ✅ Persistent sessions
- ✅ Full control
- ✅ No cold starts
- ✅ Can handle high volume
- ✅ Reliable

**Cons:**
- ❌ Requires server management
- ❌ Monthly costs
- ❌ Need to configure security

**Recommended Specs:**
- 1GB RAM minimum
- 1 CPU core
- 25GB disk
- Ubuntu 22.04 LTS

**Cost:** ~$5-10/month

---

### Option 4: Docker Container
Best for: Containerized environments, Kubernetes, easy deployment

**Create Dockerfile:**
```dockerfile
FROM node:20-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**Build and run:**
```bash
docker build -t whatsapp-mcp .
docker run -d -p 3000:3000 --name whatsapp-mcp \
  -e SESSION_PATH=/data/.wwebjs_auth \
  -e QUEUE_DB_PATH=/data/queue.json \
  -v $(pwd)/data:/data \
  whatsapp-mcp
```

**With Docker Compose:**
```yaml
version: '3.8'
services:
  whatsapp-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      SESSION_PATH: /data/.wwebjs_auth
      QUEUE_DB_PATH: /data/queue.json
      MIN_DELAY: 5000
      MAX_DELAY: 15000
    volumes:
      - ./data:/data
    restart: unless-stopped
```

**Pros:**
- ✅ Portable
- ✅ Isolated environment
- ✅ Easy to scale
- ✅ Version control

**Cons:**
- ❌ Requires Docker knowledge
- ❌ Slightly more complex setup

---

### Option 5: Railway.app
Best for: Simple deployment without managing servers

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Connect your GitHub repo
4. Deploy!
5. Add environment variables in Railway dashboard

**Pros:**
- ✅ Simple deployment
- ✅ Persistent storage
- ✅ Auto-deploys from git
- ✅ Free tier available

**Cons:**
- ⚠️ Limited free tier
- ⚠️ Can be expensive at scale

---

## 📊 Comparison Table

| Platform | Setup | Cost | Persistence | Scalability | Best For |
|----------|-------|------|-------------|-------------|----------|
| Local | Easy | Free | ✅ Excellent | ❌ None | Development |
| Vercel | Very Easy | Free-$20 | ❌ Poor | ✅ Excellent | MVP/Testing |
| VPS | Medium | $5-20 | ✅ Excellent | ⚠️ Manual | Production |
| Docker | Medium | Varies | ✅ Excellent | ✅ Excellent | Enterprise |
| Railway | Easy | $5-20 | ✅ Good | ✅ Good | Small Teams |

---

## 🔐 Security Recommendations

### For All Deployments:

1. **Never commit session files:**
   - Add `.wwebjs_auth/` to `.gitignore`
   - Don't share session data

2. **Use environment variables:**
   - Never hardcode credentials
   - Use `.env` files locally
   - Use platform secrets in production

3. **Firewall rules:**
   - Limit SSH access (port 22)
   - Only expose necessary ports
   - Use VPN when possible

4. **Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Use `npm audit` regularly

5. **Monitoring:**
   - Set up logging
   - Monitor for unusual activity
   - Track message volumes

---

## 🆘 Troubleshooting by Platform

### Vercel Issues
- **QR not showing:** Add more memory in vercel.json
- **Timeout:** Increase function timeout
- **Size limit:** Remove unnecessary dependencies

### VPS Issues
- **Chrome not found:** Install Chrome with provided script
- **Permission denied:** Check file permissions
- **Port in use:** Change port or kill existing process

### Docker Issues
- **Container exits:** Check logs with `docker logs whatsapp-mcp`
- **Volume issues:** Ensure correct volume mapping
- **Network issues:** Check Docker network configuration

---

## 📞 Support

For deployment help, open an issue on GitHub with:
- Platform you're deploying to
- Error messages
- Logs (without sensitive data)

---

Choose the deployment option that best fits your needs! 🚀
