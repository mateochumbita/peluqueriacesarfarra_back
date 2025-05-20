import express from 'express';
import { getStatistics } from './controller.js';

const router = express.Router();

// GET /api/statics?inicio=2025-06-01&fin=2025-06-30
router.get('/', getStatistics);

export default router;
