import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
const RATE_LIMIT = 50; // max concurrent requests

app.use(cors());
app.use(express.json());

// Simple in-memory counter
let activeRequests = 0;

async function rateLimiter(req: Request, res: Response, next: any) {
  // Block if already at max concurrency
  if (activeRequests >= RATE_LIMIT) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit of ${RATE_LIMIT} concurrent requests exceeded`,
      retryAfter: 1000,
    });
  }

  // Increment active requests when request comes in
  activeRequests++;

  // Decrement active requests when response is sent
  res.on('finish', () => {
    activeRequests--;
  });

  // Also handle errors
  res.on('close', () => {
    activeRequests--;
  });

  next();
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

process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

