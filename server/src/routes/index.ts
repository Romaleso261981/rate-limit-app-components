import { Router } from 'express';
import apiRoutes from './api';

const router = Router();

// Mount API routes
router.use('/', apiRoutes);

export default router;
