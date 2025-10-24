import { Request, Response, NextFunction } from 'express';

// Lua script for atomic decrement
const decrementScript = `
  local activeKey = KEYS[1]
  local requestId = ARGV[1]
  
  local removed = redis.call('SREM', activeKey .. ':set', requestId)
  if removed > 0 then
    redis.call('DECR', activeKey)
  end
  
  return redis.call('GET', activeKey) or '0'
`;

export const createRequestCleanup = (redisClient: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const requestId = (req as any).requestId;

    // Override res.send to cleanup after response is sent
    res.send = function(data: any) {
      // Call original send
      const result = originalSend.call(this, data);
      
      // Cleanup after response is sent
      if (requestId) {
        redisClient.eval(decrementScript, {
          keys: ['active_requests'],
          arguments: [requestId]
        }).then((currentActive: any) => {
          console.log(`Request completed, active: ${currentActive}`);
        }).catch((error: any) => {
          console.error('Error decrementing active requests:', error);
        });
      }
      
      return result;
    };

    next();
  };
};
