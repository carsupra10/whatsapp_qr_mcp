# 📱 How to Connect WhatsApp QR Code

## 🎯 Choose Your Method

### ✅ Option 1: Local with Claude Desktop (RECOMMENDED)
**Best for:** Personal use, full features, persistent sessions

### 🌐 Option 2: Vercel Web Interface  
**Best for:** Demo, testing, temporary use

---

## 📍 Option 1: Local with Claude Desktop

### Step-by-Step Guide

#### 1. Start the Server

```bash
cd whatsapp-mcp
npm install
npm run build
npm start
```

You'll see:
```
Initializing WhatsApp client...
WhatsApp MCP Server running on stdio
```

#### 2. Configure Claude Desktop

**macOS:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Add this configuration:**
```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "node",
      "args": ["/FULL/PATH/TO/whatsapp-mcp/dist/index.js"],
      "env": {
        "SESSION_PATH": "/FULL/PATH/TO/whatsapp-mcp/.wwebjs_auth"
      }
    }
  }
}
```

**Example paths:**
- macOS: `/Users/yourname/whatsapp-mcp/dist/index.js`
- Windows: `C:\\Users\\yourname\\whatsapp-mcp\\dist\\index.js`

#### 3. Restart Claude Desktop

Completely close and reopen Claude Desktop.

#### 4. Get QR Code

In Claude, type:
```
Check my WhatsApp authentication status
```

or

```
Get WhatsApp QR code
```

Claude will call the `get_auth_status` tool and show you the QR code.

#### 5. Scan the QR Code

1. Open **WhatsApp** on your phone
2. Tap the **⋮** (three dots) or **Settings**
3. Select **Linked Devices**
4. Tap **Link a Device**
5. Point your camera at the QR code in Claude

#### 6. ✅ Connected!

You'll see in Claude:
```json
{
  "status": "authenticated",
  "ready": true,
  "message": "WhatsApp is authenticated"
}
```

#### 7. Start Using

Try these commands in Claude:
```
"Send 'Hello!' to +1234567890 via WhatsApp"
"List my recent WhatsApp chats"
"Show my WhatsApp message queue status"
"Get WhatsApp analytics for last 7 days"
```

---

## 🌐 Option 2: Vercel Web Interface

### Quick Connect

1. **Visit:**  
   https://whatsappqrmcp.vercel.app/api/connect

2. **Wait for QR Code**  
   It may take 30-60 seconds to generate (cold start)

3. **Scan with WhatsApp**
   - Open WhatsApp on your phone
   - Settings → Linked Devices
   - Link a Device
   - Scan the QR code

4. **✅ Connected!**  
   Page will show "Connected Successfully!"

### ⚠️ Vercel Limitations

- **Temporary Session** - Lost on redeploy
- **Cold Starts** - First load is slow (30-60s)
- **Not for Production** - Use local or VPS instead
- **May Not Work** - Vercel may not have Chrome/Puppeteer

### Alternative: Get QR as JSON

Visit: https://whatsappqrmcp.vercel.app/api/qr

Response:
```json
{
  "status": "qr_ready",
  "qrCode": "data:image/png;base64,iVBOR...",
  "instructions": {...}
}
```

Copy the `qrCode` data URL and open in browser to view.

---

## 🔧 Troubleshooting

### QR Code Not Showing (Local)

**Check if server is running:**
```bash
ps aux | grep node
```

**Check logs:**
Look at terminal where you ran `npm start`

**Restart:**
```bash
# Kill the server (Ctrl+C)
# Start again
npm start
```

### Claude Not Seeing Tools

**1. Check config path:**
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

**2. Verify path is absolute** (not relative)
❌ Wrong: `./dist/index.js`
✅ Right: `/Users/yourname/whatsapp-mcp/dist/index.js`

**3. Restart Claude completely**
- Quit from menu bar/system tray
- Open again

**4. Check logs:**
- macOS: `~/Library/Logs/Claude/`
- Windows: `%APPDATA%\Claude\logs\`

### QR Code Not Showing (Vercel)

**Issue:** Vercel cold start or Chrome not available

**Solutions:**
1. **Wait longer** - First load takes 30-60 seconds
2. **Refresh page** - Click "Refresh QR Code" button
3. **Use local instead** - More reliable
4. **Check /api/qr** - Get JSON response directly

### Session Keeps Expiring

**Local:**
- Check `.wwebjs_auth` folder exists
- Don't delete this folder
- Make sure path in config is correct

**Vercel:**
- Expected behavior (stateless)
- Sessions lost on redeploy
- Not suitable for production

### "WhatsApp client is not ready"

**Wait a few seconds** - Initialization takes 10-30 seconds

**Check status:**
```
"Check WhatsApp authentication status"
```

**If failed, restart:**
```bash
# Stop server (Ctrl+C)
# Clear session if needed
rm -rf .wwebjs_auth
# Start again
npm start
```

---

## 📊 Connection Status

### Status Messages

| Status | Meaning | Action |
|--------|---------|--------|
| `pending` | Starting up | Wait 10-30 seconds |
| `qr_ready` | QR code available | Scan with phone |
| `authenticated` | Connected | Ready to use! |
| `failed` | Error occurred | Restart server |

### Checking Status

**In Claude:**
```
"Check my WhatsApp status"
```

**Via API (if running HTTP):**
```bash
curl http://localhost:3000/api/qr
```

---

## 🎓 What Happens After Connection

### Session Persistence

**Local:**
- ✅ Session saved in `.wwebjs_auth/` folder
- ✅ Auto-login on next run
- ✅ Lasts until you logout or delete folder

**Vercel:**
- ⚠️ Session in `/tmp/` (ephemeral)
- ⚠️ Lost on next deployment
- ⚠️ Need to rescan QR code

### Using Connected Session

Once connected, you can:

1. **Send Messages:**
```
"Send 'Hello' to +1234567890"
```

2. **Read Messages:**
```
"Show me messages from chat 1234567890@c.us"
```

3. **List Chats:**
```
"Show my recent WhatsApp chats"
```

4. **Get Contacts:**
```
"List my WhatsApp contacts"
```

5. **Check Queue:**
```
"Show my message queue status"
```

6. **View Analytics:**
```
"Get my WhatsApp analytics"
```

---

## 🔐 Security Notes

### Session Files

- **Contains:** WhatsApp authentication tokens
- **Location:** `.wwebjs_auth/` folder
- **Security:** Keep private, don't share
- **Backup:** Copy folder to save session

### Best Practices

1. ✅ Don't commit `.wwebjs_auth` to git (already in .gitignore)
2. ✅ Don't share session files
3. ✅ Use strong passwords on your machine
4. ✅ Logout when done (optional)
5. ✅ Keep server logs private

### Logging Out

**To disconnect:**

In Claude:
```
"Logout from WhatsApp"
```

Or delete session folder:
```bash
rm -rf .wwebjs_auth
```

---

## 💡 Tips

### For Best Experience

1. **Use Local** - Most reliable and persistent
2. **Keep Server Running** - Don't stop during use
3. **Use Queue Mode** - For bulk messages (prevents blocking)
4. **Monitor Analytics** - Check success rates
5. **Business Account** - Higher rate limits

### Common Use Cases

**Send bulk messages:**
```
"Send these messages via WhatsApp:
1. To +1111111111: 'Message 1'
2. To +2222222222: 'Message 2'
3. To +3333333333: 'Message 3'
Use the queue to prevent blocking"
```

**Check before sending:**
```
"Is my WhatsApp connected and ready?"
```

**Monitor queue:**
```
"How many messages are pending in my WhatsApp queue?"
```

---

## 📚 Need More Help?

- **Documentation:** [README.md](README.md)
- **Quick Start:** [GET_STARTED.md](GET_STARTED.md)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Issues:** [Open an issue](https://github.com/theaathish/whatsapp_qr_mcp/issues)

---

## ✅ Quick Checklist

### Local Setup

- [ ] Server running (`npm start`)
- [ ] Claude Desktop config updated
- [ ] Claude Desktop restarted
- [ ] QR code requested in Claude
- [ ] QR code scanned with phone
- [ ] Status shows "authenticated"
- [ ] Test message sent successfully

### Vercel Setup

- [ ] Visit https://whatsappqrmcp.vercel.app/api/connect
- [ ] Wait for QR code (30-60s)
- [ ] Scan with WhatsApp
- [ ] Connection confirmed
- [ ] Understand limitations
- [ ] Consider VPS for production

---

**You're now ready to use WhatsApp with Claude! 🎉**
