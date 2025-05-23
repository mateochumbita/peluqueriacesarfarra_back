import express from 'express';
import { 
    createHairdresserWithUser, 
    getAllHairdressers, 
    getHairdresserById, 
    updateHairdresser, 
    deleteHairdresser, 
    searchHairdressers 
} from './controller.js';

const router = express.Router();

// Rutas para los peluqueros
router.post('/', createHairdresserWithUser); // Crear un peluquero
router.get('/', getAllHairdressers); // Obtener todos los peluqueros
router.get('/search', searchHairdressers); // Buscar peluqueros con filtros
router.get('/:id', getHairdresserById); // Obtener un peluquero por ID
router.put('/:id', updateHairdresser); // Actualizar un peluquero
router.delete('/:id', deleteHairdresser); // Eliminar un peluquero

export default router;