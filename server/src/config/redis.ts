import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

export const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

export const initializeRedis = async () => {
  try {
    await redisClient.connect();
    // Reset counters on startup
    await redisClient.del('rate_limit_window');
    await redisClient.set('active_requests', '0');
    await redisClient.del('active_requests:set');
    console.log('Redis connected and counters reset');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const closeRedis = async () => {
  await redisClient.quit();
};
