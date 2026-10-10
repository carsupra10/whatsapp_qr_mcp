import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    status: 'healthy',
    service: 'WhatsApp MCP Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    features: {
      qrAuth: true,
      messageQueue: true,
      rateLimiting: true,
      analytics: true,
      mcpProtocol: true,
      httpApi: true,
    },
    deployment: {
      platform: 'vercel',
      region: process.env.VERCEL_REGION || 'unknown',
    },
    note: 'This instance is stateless. For persistent WhatsApp sessions, run locally or on a VPS.',
  });
}
