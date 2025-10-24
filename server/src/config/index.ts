export const config = {
  PORT: process.env.PORT || 3001,
  RATE_LIMIT: 50, // requests per second
  CONCURRENCY_LIMIT: 10, // max concurrent requests
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
};
