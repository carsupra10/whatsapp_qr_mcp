import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const htmlPath = join(process.cwd(), 'public', 'qr.html');
    const html = readFileSync(htmlPath, 'utf-8');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error: any) {
    // Fallback if file read fails
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp MCP Server</title>
        <style>
          body { 
            font-family: system-ui; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f5f5f5;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #333; }
          .warning {
            background: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
          }
          a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🔗 WhatsApp MCP Server</h1>
          
          <div class="warning">
            <strong>⚠️ Vercel Limitation</strong><br>
            WhatsApp connections cannot run on Vercel due to serverless limitations.
          </div>
          
          <h2>How to Connect:</h2>
          <p><strong>Option 1: Local with Claude Desktop (Recommended)</strong></p>
          <ol>
            <li>Clone: <code>git clone https://github.com/theaathish/whatsapp_qr_mcp.git</code></li>
            <li>Install: <code>npm install && npm run build</code></li>
            <li>Run: <code>npm start</code></li>
            <li>Configure Claude Desktop</li>
            <li>Ask Claude for QR code</li>
            <li>Scan with phone</li>
          </ol>
          
          <p><strong>Option 2: VPS Deployment</strong></p>
          <p>Deploy to DigitalOcean, AWS, or Railway for production use (~$5-10/month)</p>
          
          <p style="margin-top: 30px;">
            📚 <a href="https://github.com/theaathish/whatsapp_qr_mcp" target="_blank">
              Full Documentation on GitHub
            </a>
          </p>
        </div>
      </body>
      </html>
    `);
  }
}
