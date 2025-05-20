import express from 'express';
import { 
    createEarning, 
    getAllEarnings, 
    getEarningById, 
    updateEarning, 
    deleteEarning, 
    searchEarnings 
} from './controller.js';

const router = express.Router();

// Rutas para Earnings
router.post('/', createEarning); // Crear un earning
router.get('/', getAllEarnings); // Obtener todos los earnings
router.get('/search', searchEarnings); // Buscar earnings con filtros
router.get('/:id', getEarningById); // Obtener un earning por ID
router.put('/:id', updateEarning); // Actualizar un earning
router.delete('/:id', deleteEarning); // Eliminar un earning

export default router;