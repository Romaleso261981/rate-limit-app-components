import express from 'express';
import cors from 'cors';
import routes from './routes';
import { initializeRedis, closeRedis } from './config/redis';
import { config } from './config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Initialize Redis and start server
(async () => {
  try {
    await initializeRedis();
    
    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});
