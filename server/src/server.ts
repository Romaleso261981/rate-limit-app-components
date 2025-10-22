import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from 'redis';

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT = 1000; // Much higher limit, let client control the rate
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

app.use(cors());
app.use(express.json());

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

async function rateLimiter(req: Request, res: Response, next: any) {
  const now = Date.now();
  const key = 'request_count';
  const windowKey = 'window_start';

  try {
    const windowStart = await redisClient.get(windowKey);
    const currentWindowStart = windowStart ? parseInt(windowStart) : now;

    // If more than 1 second has passed, reset the window
    if (now - currentWindowStart >= 1000) {
      await redisClient.set(windowKey, now.toString());
      await redisClient.set(key, '0');
      return next();
    }

    const count = await redisClient.incr(key);

    // Add proportional delay if rate limit exceeded
    if (count > RATE_LIMIT) {
      const timePassed = now - currentWindowStart;
      const timeRemaining = 1000 - timePassed;
      const excessRequests = count - RATE_LIMIT;
      const delayPerRequest = timeRemaining / excessRequests;
      
      console.log(`Rate limit exceeded (${count}/${RATE_LIMIT}), delaying by ${delayPerRequest}ms`);
      await new Promise(resolve => setTimeout(resolve, delayPerRequest));
    }

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

  res.json({
    index,
    message: 'Success',
    delay,
    timestamp: Date.now(),
  });
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

