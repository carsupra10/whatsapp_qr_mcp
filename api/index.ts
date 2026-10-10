import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Welcome page
  if (req.method === 'GET' && req.url === '/') {
    res.status(200).json({
      name: 'WhatsApp MCP Server',
      version: '1.0.0',
      status: 'running',
      description: 'WhatsApp MCP Server with QR authentication and queue management',
      endpoints: {
        health: '/api/health',
        qr: '/api/qr',
        connect: '/api/connect',
        auth: '/api/auth',
        send: '/api/send',
        chats: '/api/chats',
        contacts: '/api/contacts',
        queue: '/api/queue',
        analytics: '/api/analytics',
      },
      documentation: 'https://github.com/theaathish/whatsapp_qr_mcp',
      usage: {
        claude: 'Use MCP protocol with Claude Desktop',
        chatgpt: 'Use HTTP API endpoints with Custom GPT',
        local: 'Run locally with npm start',
      },
      note: 'For MCP usage with Claude Desktop, run this locally. For HTTP API, use the /api/* endpoints.',
    });
    return;
  }

  res.status(404).json({
    error: 'Not Found',
    message: 'This is a WhatsApp MCP Server. For usage instructions, visit https://github.com/theaathish/whatsapp_qr_mcp',
    availableEndpoints: [
      '/api/health',
      '/api/auth',
      '/api/send',
      '/api/chats',
      '/api/contacts',
      '/api/queue',
      '/api/analytics',
    ],
  });
}
