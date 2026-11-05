import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize MongoDB Atlas connection foundation
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`===============================================`);
    console.log(`  ArthaAI Backend Service Started Successfully`);
    console.log(`  Port:        ${env.PORT}`);
    console.log(`  Environment: ${env.NODE_ENV}`);
    console.log(`  Health API:  http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    console.log(`===============================================`);
  });

  // Graceful shutdown handling
  const handleShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);

    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      console.log('[Server] Graceful shutdown complete. Exiting.');
      process.exit(0);
    });

    // Force exit after 10 seconds if shutdown hangs
    setTimeout(() => {
      console.error('[Server] Could not close connections in time. Forcefully terminating.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('[Fatal Error] Failed to bootstrap ArthaAI server:', error);
  process.exit(1);
});

