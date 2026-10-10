import { createHostedServerApp } from './server.js';

const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

const app = createHostedServerApp();

const server = app.listen(port, host, () => {
  console.log(`[git-grass-hosted-ai] Server listening on http://${host}:${port}`);
  console.log(`[git-grass-hosted-ai] Health check: http://${host}:${port}/health`);
  console.log(`[git-grass-hosted-ai] Active Provider: ${process.env.AI_PROVIDER || 'backboard'}`);
});

process.on('SIGTERM', () => {
  console.log('[git-grass-hosted-ai] SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[git-grass-hosted-ai] SIGINT received, shutting down gracefully...');
  server.close(() => process.exit(0));
});

