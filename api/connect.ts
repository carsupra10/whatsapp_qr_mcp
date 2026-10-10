import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const html = readFileSync(join(process.cwd(), 'public', 'qr.html'), 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load QR page',
      message: 'Visit /api/qr for JSON response or see documentation',
    });
  }
}
