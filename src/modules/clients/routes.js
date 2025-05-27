import express from 'express';
import { 
    createClient, 
    getAllClients, 
    getClientById, 
    updateClient, 
    deleteClient, 
    searchClients,
    getClientsStats
} from './controller.js';

const router = express.Router();

// Rutas para los clientes
router.get('/stats', getClientsStats); // Obtener estadísticas de clientes
router.get('/', getAllClients); // Obtener todos los clientes
router.get('/search', searchClients); // Buscar clientes con filtros
router.get('/:id', getClientById); // Obtener un cliente por ID
router.post('/', createClient); // Crear un cliente
router.put('/:id', updateClient); // Actualizar un cliente
router.delete('/:id', deleteClient); // Eliminar un cliente

export default router;