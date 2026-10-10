import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    status: 'unavailable',
    message: 'WhatsApp QR authentication cannot run on Vercel serverless functions',
    reason: 'WhatsApp Web requires Chrome/Puppeteer and persistent sessions, which are not available in Vercel\'s stateless environment.',
    alternatives: [
      {
        method: 'Local with Claude Desktop',
        description: 'Run the MCP server locally on your machine',
        recommended: true,
        steps: [
          'Clone the repository',
          'Run npm install && npm run build',
          'Run npm start',
          'Configure Claude Desktop with MCP server path',
          'Ask Claude to check WhatsApp status',
          'Scan QR code with your phone'
        ],
        documentation: 'https://github.com/theaathish/whatsapp_qr_mcp/blob/main/CONNECT_WHATSAPP.md'
      },
      {
        method: 'VPS Deployment',
        description: 'Deploy to a VPS with persistent storage',
        recommended: true,
        providers: ['DigitalOcean', 'AWS EC2', 'Linode', 'Railway.app'],
        cost: '$5-10/month',
        documentation: 'https://github.com/theaathish/whatsapp_qr_mcp/blob/main/DEPLOYMENT.md'
      },
      {
        method: 'Docker',
        description: 'Run in a Docker container',
        recommended: true,
        documentation: 'https://github.com/theaathish/whatsapp_qr_mcp/blob/main/DEPLOYMENT.md#option-4-docker-container'
      }
    ],
    whyVercelDoesntWork: {
      issue1: 'Stateless functions - no persistent session storage',
      issue2: 'No Chrome/Chromium binary available',
      issue3: 'Puppeteer requires system dependencies not available in serverless',
      issue4: 'Cold starts and timeouts interrupt WhatsApp connection',
      issue5: 'Ephemeral /tmp storage cleared between invocations'
    },
    quickStart: {
      local: 'git clone https://github.com/theaathish/whatsapp_qr_mcp.git && cd whatsapp_qr_mcp && npm install && npm run build && npm start',
      documentation: 'See CONNECT_WHATSAPP.md for full guide'
    },
    note: 'This Vercel deployment serves as documentation and API reference. For actual WhatsApp functionality, please deploy locally or to a VPS.'
  });
}
