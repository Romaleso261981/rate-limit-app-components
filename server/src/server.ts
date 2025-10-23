import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from 'redis';

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT = 50;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

app.use(cors());
app.use(express.json());

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

(async () => {
  try {
    await redisClient.connect();
    // Reset active requests counter on startup
    await redisClient.set('active_requests', '0');
    console.log('Redis connected and counter reset');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

async function rateLimiter(req: Request, res: Response, next: any) {
  const activeKey = 'active_requests';

  try {
    // Get current active requests
    const activeCount = await redisClient.get(activeKey) || '0';

    // Block if already at max concurrency
    if (+activeCount >= RATE_LIMIT) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit of ${RATE_LIMIT} concurrent requests exceeded`,
        retryAfter: 1000,
      });
    }

    // Increment active requests when request comes in
    await redisClient.incr(activeKey);
    console.log(`Request started, active: ${await redisClient.get(activeKey)}`);

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next();
  }
}

app.post('/api', rateLimiter, async (req: Request, res: Response) => {
  const { index } = req.body;

  const delay = Math.floor(Math.random() * 1000) + 1;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Get current active requests for response
  const activeCount = await redisClient.get('active_requests') || '0';

  res.json({
    index,
    activeCount,
    message: 'Success',
    delay,
    timestamp: Date.now(),
  });

  // Decrement after response is sent
  await redisClient.decr('active_requests');
  const currentActive = await redisClient.get('active_requests');
  console.log(`Request ${index} completed, active: ${currentActive}`);
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

