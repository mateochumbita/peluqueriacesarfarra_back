import express from 'express';
import { 
    createAppointment, 
    getAllAppointments, 
    getAppointmentById, 
    updateAppointment, 
    deleteAppointment, 
    searchAppointments 
} from './controller.js';

const router = express.Router();

// Rutas para las citas
router.post('/', createAppointment); // Crear una cita
router.get('/', getAllAppointments); // Obtener todas las citas
router.get('/search', searchAppointments); // Buscar citas con filtros
router.get('/:id', getAppointmentById); // Obtener una cita por ID
router.put('/:id', updateAppointment); // Actualizar una cita
router.delete('/:id', deleteAppointment); // Eliminar una cita

export default router;