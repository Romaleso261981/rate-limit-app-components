import { Request, Response } from 'express';
import { RequestService } from '../services/requestService';

export class ApiController {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService();
  }

  async handleApiRequest(req: Request, res: Response): Promise<void> {
    try {
      const { index } = req.body;
      
      if (!index || typeof index !== 'number') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Index is required and must be a number'
        });
        return;
      }

      const result = await this.requestService.processRequest(index);
      res.json(result);
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An error occurred while processing the request'
      });
    }
  }

  async handleHealthCheck(req: Request, res: Response): Promise<void> {
    res.json({ 
      status: 'ok', 
      timestamp: Date.now(),
      uptime: process.uptime()
    });
  }
}
