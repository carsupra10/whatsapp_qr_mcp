import type { VercelRequest, VercelResponse } from '@vercel/node';
import { WhatsAppClient } from '../src/whatsapp.js';

let whatsappClient: WhatsAppClient | null = null;
let qrCodeData: string | null = null;
let isInitializing = false;

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

  try {
    // Initialize WhatsApp client if not already done
    if (!whatsappClient && !isInitializing) {
      isInitializing = true;
      
      whatsappClient = new WhatsAppClient({
        sessionPath: process.env.SESSION_PATH || '/tmp/.wwebjs_auth',
      });

      // Listen for QR code
      whatsappClient.on('qr', (data: any) => {
        qrCodeData = data.dataUrl;
        console.log('QR code received');
      });

      whatsappClient.on('ready', () => {
        console.log('WhatsApp ready');
        qrCodeData = null; // Clear QR code when authenticated
      });

      whatsappClient.on('authenticated', () => {
        console.log('WhatsApp authenticated');
        qrCodeData = null;
      });

      // Start initialization (non-blocking)
      whatsappClient.initialize().catch((error) => {
        console.error('WhatsApp initialization error:', error);
        isInitializing = false;
      });
    }

    // Get auth status
    const status = whatsappClient?.getAuthStatus() || {
      status: 'initializing',
      ready: false,
      qrCode: null,
    };

    res.status(200).json({
      status: status.status,
      ready: status.ready,
      qrCode: qrCodeData || status.qrCode,
      message: getStatusMessage(status.status),
      note: 'Vercel deployment has limitations. Sessions are ephemeral and will be lost on redeploy. For production use, deploy to VPS.',
      instructions: {
        step1: 'Wait for QR code to appear (may take 30-60 seconds)',
        step2: 'Open WhatsApp on your phone',
        step3: 'Go to Settings → Linked Devices',
        step4: 'Tap "Link a Device"',
        step5: 'Scan the QR code shown above',
        step6: 'Session will persist until next deployment',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get auth status',
      message: error.message,
      note: 'This may be due to Vercel cold start or Chrome not being available. For reliable WhatsApp connections, use local deployment or VPS.',
    });
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Initializing WhatsApp client... Please wait.';
    case 'qr_ready':
      return 'QR code is ready! Scan it with WhatsApp mobile app.';
    case 'authenticated':
      return 'WhatsApp is authenticated and ready to use!';
    case 'failed':
      return 'Authentication failed. Please refresh and try again.';
    default:
      return 'Checking authentication status...';
  }
}
