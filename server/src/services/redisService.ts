import { redisClient } from '../config/redis';

export class RedisService {
  async getActiveRequests(): Promise<string> {
    return await redisClient.get('active_requests') || '0';
  }

  async incrementActiveRequests(): Promise<void> {
    await redisClient.incr('active_requests');
  }

  async decrementActiveRequests(): Promise<void> {
    await redisClient.decr('active_requests');
  }

  async resetCounters(): Promise<void> {
    await redisClient.del('rate_limit_window');
    await redisClient.set('active_requests', '0');
    await redisClient.del('active_requests:set');
  }
}
