import { Request, Response, NextFunction } from 'express';

// Lua script for atomic rate limiting with sliding window
const rateLimitScript = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requestId = ARGV[4]
  
  -- Clean old entries (older than window)
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
  
  -- Count current requests in window
  local current = redis.call('ZCARD', key)
  
  if current >= limit then
    return {0, current}
  end
  
  -- Add current request
  redis.call('ZADD', key, now, requestId)
  redis.call('EXPIRE', key, window)
  
  return {1, current + 1}
`;

export const createRateLimiter = (redisClient: any, rateLimit: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rateLimitKey = 'rate_limit_window';
    const windowSize = 1000; // 1 second in milliseconds
    const requestId = `${Date.now()}-${Math.random()}`;
    
    try {
      const result = await redisClient.eval(rateLimitScript, {
        keys: [rateLimitKey],
        arguments: [windowSize.toString(), rateLimit.toString(), Date.now().toString(), requestId]
      }) as [number, number];
      
      const [allowed, currentCount] = result;
      
      if (!allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit of ${rateLimit} requests per second exceeded`,
          retryAfter: 1000,
          currentCount
        });
      }
      
      // Store request ID for later cleanup
      (req as any).requestId = requestId;
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
