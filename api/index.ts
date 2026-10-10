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
      important: '⚠️ This Vercel deployment is for documentation only. WhatsApp cannot run on serverless platforms.',
      quickStart: 'Visit /api/connect for setup instructions',
      endpoints: {
        connect: '/api/connect - Setup instructions and deployment options',
        health: '/api/health - Service health check',
        qr: '/api/qr - QR code information (explains limitations)',
      },
      deploymentOptions: {
        local: 'Run locally with Claude Desktop (Recommended)',
        vps: 'Deploy to VPS for production ($5-10/month)',
        docker: 'Run in Docker container',
      },
      documentation: 'https://github.com/theaathish/whatsapp_qr_mcp',
      guides: {
        connection: 'https://github.com/theaathish/whatsapp_qr_mcp/blob/main/CONNECT_WHATSAPP.md',
        deployment: 'https://github.com/theaathish/whatsapp_qr_mcp/blob/main/DEPLOYMENT.md',
        whyVercelFails: 'https://github.com/theaathish/whatsapp_qr_mcp/blob/main/WHY_VERCEL_FAILS.md',
      },
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
