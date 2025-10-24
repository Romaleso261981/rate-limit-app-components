import { Request, Response, NextFunction } from 'express';

// Lua script for atomic concurrency control
const concurrencyScript = `
  local activeKey = KEYS[1]
  local limit = tonumber(ARGV[1])
  local requestId = ARGV[2]
  
  local current = tonumber(redis.call('GET', activeKey) or '0')
  
  if current >= limit then
    return {0, current}
  end
  
  redis.call('INCR', activeKey)
  redis.call('SADD', activeKey .. ':set', requestId)
  
  return {1, current + 1}
`;

export const createConcurrencyLimiter = (redisClient: any, concurrencyLimit: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const activeKey = 'active_requests';
    const requestId = (req as any).requestId || `${Date.now()}-${Math.random()}`;
    
    try {
      const result = await redisClient.eval(concurrencyScript, {
        keys: [activeKey],
        arguments: [concurrencyLimit.toString(), requestId]
      }) as [number, number];
      
      const [allowed, currentCount] = result;
      
      if (!allowed) {
        return res.status(429).json({
          error: 'Too Many Concurrent Requests',
          message: `Concurrency limit of ${concurrencyLimit} exceeded`,
          retryAfter: 1000,
          currentCount
        });
      }
      
      (req as any).requestId = requestId;
      console.log(`Request started, active: ${currentCount}`);
      next();
    } catch (error) {
      console.error('Concurrency limiter error:', error);
      next();
    }
  };
};
