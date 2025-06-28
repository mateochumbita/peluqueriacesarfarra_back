import express from 'express';
import { 
    createAppointment, 
    getAllAppointments, 
    getAllAppointmentsDay,
    getAppointmentById, 
    updateAppointment, 
    deleteAppointment, 
    searchAppointments,
    getAppointmentsStats,
    getAppointmentsByClientId
} from './controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Citas
 *   description: Gestión de turnos en la peluquería
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Crear una nueva cita
 *     tags: [Citas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: string
 *               hairdresserId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 */
router.post('/', createAppointment);

/**
 * @swagger
 * /appointments/stats:
 *   get:
 *     summary: Obtener estadísticas de citas
 *     tags: [Citas]
 *     responses:
 *       200:
 *         description: Estadísticas generales de citas
 */
router.get('/stats', getAppointmentsStats);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtener todas las citas
 *     tags: [Citas]
 *     responses:
 *       200:
 *         description: Lista de todas las citas
 */
router.get('/', getAllAppointments);

/**
 * @swagger
 * /appointments/day:
 *   get:
 *     summary: Obtener las citas de un día específico
 *     tags: [Citas]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para filtrar las citas
 *     responses:
 *       200:
 *         description: Citas del día seleccionado
 */
router.get('/day', getAllAppointmentsDay);



/**
 * @swagger
 * /appointments/client/{clientId}:
 *   get:
 *     summary: Obtener historial de citas por ID de cliente
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente para filtrar las citas
 *     responses:
 *       200:
 *         description: Lista de citas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 localResults:
 *                   type: array
 *                   description: Resultados obtenidos de la base de datos local
 *                   items:
 *                     type: object
 *                 supabaseResults:
 *                   type: array
 *                   description: Resultados obtenidos de Supabase
 *                   items:
 *                     type: object
 *       404:
 *         description: No se encontraron citas para el cliente especificado
 */

router.get("/client/:clientId", getAppointmentsByClientId);
/**
 * @swagger
 * /appointments/search:
 *   get:
 *     summary: Buscar citas por filtros
 *     tags: [Citas]
 *     parameters:
 *       - in: query
 *         name: cliente
 *         schema:
 *           type: string
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda filtrada
 */
router.get('/search', searchAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Obtener una cita por ID
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la cita
 */
router.get('/:id', getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Actualizar una cita existente
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 */
router.put('/:id', updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Eliminar una cita
 *     tags: [Citas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cita eliminada correctamente
 */
router.delete('/:id', deleteAppointment);

export default router;
