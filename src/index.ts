#!/usr/bin/env node
import { WhatsAppMCPServer } from './server.js';

const server = new WhatsAppMCPServer();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down...');
  await server.stop();
  process.exit(0);
});

// Start the server
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
