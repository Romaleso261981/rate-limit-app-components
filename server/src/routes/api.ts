import { Router } from 'express';
import { ApiController } from '../controllers/apiController';
import { createRateLimiter, createConcurrencyLimiter, createRequestCleanup } from '../middleware';
import { redisClient } from '../config/redis';
import { config } from '../config';

const router = Router();
const apiController = new ApiController();

// Create middleware instances
const rateLimiter = createRateLimiter(redisClient as any, config.RATE_LIMIT);
const concurrencyLimiter = createConcurrencyLimiter(redisClient as any, config.CONCURRENCY_LIMIT);
const requestCleanup = createRequestCleanup(redisClient as any);

// Apply middleware to API routes
router.post('/api', rateLimiter, concurrencyLimiter, requestCleanup, (req, res) => {
  apiController.handleApiRequest(req, res);
});

router.get('/health', (req, res) => {
  apiController.handleHealthCheck(req, res);
});

export default router;
