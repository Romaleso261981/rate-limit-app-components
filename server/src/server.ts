import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from 'redis';

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT = 50; // max requests per second
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Middleware
app.use(cors());
app.use(express.json());

// Redis client
const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// Rate limiter middleware
async function rateLimiter(req: Request, res: Response, next: any) {
  const now = Date.now();
  const key = 'request_count';
  const windowKey = 'window_start';

  try {
    // Get current window start time
    const windowStart = await redisClient.get(windowKey);
    const currentWindowStart = windowStart ? parseInt(windowStart) : now;

    // If more than 1 second has passed, reset the window
    if (now - currentWindowStart >= 1000) {
      await redisClient.set(windowKey, now.toString());
      await redisClient.set(key, '1');
      return next();
    }

    // Increment request count
    const count = await redisClient.incr(key);

    // Check if rate limit exceeded
    if (count > RATE_LIMIT) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit of ${RATE_LIMIT} requests per second exceeded`,
        retryAfter: 1000 - (now - currentWindowStart),
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // If Redis fails, allow the request
    next();
  }
}

// API endpoint
app.post('/api', rateLimiter, async (req: Request, res: Response) => {
  const { index } = req.body;

  // Random delay between 1-1000ms
  const delay = Math.floor(Math.random() * 1000) + 1;
  await new Promise(resolve => setTimeout(resolve, delay));

  res.json({
    index,
    message: 'Success',
    delay,
    timestamp: Date.now(),
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

