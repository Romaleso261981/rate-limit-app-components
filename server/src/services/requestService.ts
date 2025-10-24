import { RedisService } from './redisService';

export interface RequestResult {
  index: number;
  activeCount: string;
  message: string;
  delay: number;
  timestamp: number;
}

export class RequestService {
  private redisService: RedisService;

  constructor() {
    this.redisService = new RedisService();
  }

  async processRequest(index: number): Promise<RequestResult> {
    // Simulate processing delay
    const delay = Math.floor(Math.random() * 1000) + 1;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Get current active requests for response
    const activeCount = await this.redisService.getActiveRequests();

    return {
      index,
      activeCount,
      message: 'Success',
      delay,
      timestamp: Date.now(),
    };
  }
}
