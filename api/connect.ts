import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp MCP Server - Connect</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 40px auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
        }
        h1 { color: #333; font-size: 32px; margin-bottom: 10px; text-align: center; }
        .subtitle { color: #666; margin-bottom: 30px; text-align: center; }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .warning h3 { color: #856404; margin-bottom: 10px; }
        .warning p { color: #856404; line-height: 1.6; }
        .option {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .option.recommended {
            border-left-color: #28a745;
            background: #f1f8f4;
        }
        .option h3 { color: #333; margin-bottom: 10px; }
        .badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        .code {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-family: monospace;
            font-size: 13px;
            overflow-x: auto;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 10px;
            transition: 0.3s;
        }
        .btn:hover { background: #5568d3; }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
        }
        .footer a { color: #667eea; text-decoration: none; }
        ol, ul { margin: 15px 0 15px 25px; line-height: 1.8; }
        p { line-height: 1.6; color: #555; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 Connect WhatsApp</h1>
        <p class="subtitle">WhatsApp MCP Server Setup Guide</p>
        
        <div class="warning">
            <h3>⚠️ Important: Vercel Cannot Run WhatsApp</h3>
            <p>
                WhatsApp Web requires Chrome/Puppeteer and persistent sessions, which are 
                <strong>not available in Vercel's serverless environment</strong>.
            </p>
            <p style="margin-top: 10px;">
                This page provides instructions for proper deployment methods.
            </p>
        </div>

        <div class="option recommended">
            <h3>💻 Option 1: Local with Claude Desktop <span class="badge">RECOMMENDED</span></h3>
            <p><strong>Best for:</strong> Personal use, testing, full features</p>
            
            <p style="margin-top: 15px;"><strong>Quick Setup:</strong></p>
            <div class="code">git clone https://github.com/theaathish/whatsapp_qr_mcp.git
cd whatsapp_qr_mcp
npm install
npm run build
npm start</div>

            <p><strong>Steps:</strong></p>
            <ol>
                <li>Run the commands above</li>
                <li>Configure Claude Desktop: Edit <code>claude_desktop_config.json</code></li>
                <li>Add MCP server path to config</li>
                <li>Restart Claude Desktop</li>
                <li>Ask Claude: "Check my WhatsApp authentication status"</li>
                <li>Scan QR code with your phone</li>
                <li>Done! Start messaging ✅</li>
            </ol>

            <a href="https://github.com/theaathish/whatsapp_qr_mcp/blob/main/CONNECT_WHATSAPP.md" 
               class="btn" target="_blank">📖 Full Setup Guide</a>
        </div>

        <div class="option recommended">
            <h3>🚀 Option 2: VPS Deployment <span class="badge">PRODUCTION</span></h3>
            <p><strong>Best for:</strong> Production, 24/7 availability, team use</p>
            
            <p style="margin-top: 15px;">
                Deploy to DigitalOcean ($6/mo), AWS EC2 ($5-10/mo), Linode ($5/mo), or Railway.app
            </p>

            <p><strong>Benefits:</strong></p>
            <ul>
                <li>✅ Persistent WhatsApp sessions</li>
                <li>✅ No re-authentication needed</li>
                <li>✅ Background queue processing</li>
                <li>✅ Always-on availability</li>
                <li>✅ Production-ready</li>
            </ul>

            <a href="https://github.com/theaathish/whatsapp_qr_mcp/blob/main/DEPLOYMENT.md" 
               class="btn" target="_blank">📖 VPS Setup Guide</a>
        </div>

        <div class="option">
            <h3>🐳 Option 3: Docker Container</h3>
            <p><strong>Best for:</strong> Containerized deployments, easy scaling</p>
            
            <div class="code">docker-compose up -d</div>

            <p>Run with one command, includes persistent volume for session storage.</p>

            <a href="https://github.com/theaathish/whatsapp_qr_mcp/blob/main/DEPLOYMENT.md#option-4-docker-container" 
               class="btn" target="_blank">📖 Docker Guide</a>
        </div>

        <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="color: #0c5460; margin-bottom: 10px;">💡 Why Not Vercel?</h3>
            <p style="color: #0c5460;">
                Vercel serverless functions don't support:
            </p>
            <ul style="color: #0c5460; margin-left: 25px;">
                <li>Chrome/Chromium binaries (150+ MB)</li>
                <li>Persistent session storage</li>
                <li>Long-running WebSocket connections</li>
                <li>Background processes for queues</li>
                <li>System dependencies for Puppeteer</li>
            </ul>
            <p style="color: #0c5460; margin-top: 10px;">
                <strong>This Vercel deployment serves as documentation only.</strong>
            </p>
        </div>

        <div class="footer">
            <p>
                <strong>📚 Documentation:</strong>
                <a href="https://github.com/theaathish/whatsapp_qr_mcp" target="_blank">GitHub Repository</a> |
                <a href="https://github.com/theaathish/whatsapp_qr_mcp/blob/main/CONNECT_WHATSAPP.md" target="_blank">Connection Guide</a> |
                <a href="https://github.com/theaathish/whatsapp_qr_mcp/blob/main/WHY_VERCEL_FAILS.md" target="_blank">Why Vercel Fails</a>
            </p>
            <p style="margin-top: 15px; font-size: 14px;">
                WhatsApp MCP Server • Built with ❤️ for Claude & ChatGPT
            </p>
        </div>
    </div>
</body>
</html>`;

  res.status(200).send(html);
}
