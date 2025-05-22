import { Router } from 'express';
import {
  getAllHairdresserServices,
  getHairdresserServiceById,
  createHairdresserService,
  updateHairdresserService,
  deleteHairdresserService,
  searchHairdresserServices
} from './controller.js';

const router = Router();

router.get('/', getAllHairdresserServices);
router.get('/:id', getHairdresserServiceById);
router.post('/', createHairdresserService);
router.put('/:id', updateHairdresserService);
router.delete('/:id', deleteHairdresserService);

// Si tienes búsqueda avanzada
// router.get('/search', searchHairdresserServices);

export default router;