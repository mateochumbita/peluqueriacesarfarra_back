import express from 'express';
import { 
    createService, 
    getAllServices, 
    getServiceById, 
    updateService, 
    deleteService, 
    searchServices 
} from './controller.js';

const router = express.Router();

// Rutas para Services
router.post('/', createService); // Crear un servicio
router.get('/', getAllServices); // Obtener todos los servicios
router.get('/search', searchServices); // Buscar servicios con filtros
router.get('/:id', getServiceById); // Obtener un servicio por ID
router.put('/:id', updateService); // Actualizar un servicio
router.delete('/:id', deleteService); // Eliminar un servicio

export default router;