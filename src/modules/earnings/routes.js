import express from 'express';
import { 
  createEarning, 
  getAllEarnings, 
  getEarningById, 
  updateEarning, 
  deleteEarning, 
  searchEarnings,
  getEarningsStats
} from './controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Earnings
 *   description: Endpoints para la gestión de ingresos
 */

/**
 * @swagger
 * /earnings:
 *   post:
 *     summary: Crear un nuevo earning
 *     tags: [Earnings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - descripcion
 *               - fecha
 *             properties:
 *               monto:
 *                 type: number
 *               descripcion:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Earning creado correctamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post('/', createEarning);

/**
 * @swagger
 * /earnings/stats:
 *   get:
 *     summary: Obtener estadísticas de earnings
 *     tags: [Earnings]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 */
router.get('/stats', getEarningsStats);

/**
 * @swagger
 * /earnings:
 *   get:
 *     summary: Obtener todos los earnings
 *     tags: [Earnings]
 *     responses:
 *       200:
 *         description: Lista de earnings
 */
router.get('/', getAllEarnings);

/**
 * @swagger
 * /earnings/search:
 *   get:
 *     summary: Buscar earnings con filtros
 *     tags: [Earnings]
 *     parameters:
 *       - in: query
 *         name: descripcion
 *         schema:
 *           type: string
 *         description: Descripción del earning
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 */
router.get('/search', searchEarnings);

/**
 * @swagger
 * /earnings/{id}:
 *   get:
 *     summary: Obtener un earning por ID
 *     tags: [Earnings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del earning
 *     responses:
 *       200:
 *         description: Earning encontrado
 *       404:
 *         description: Earning no encontrado
 */
router.get('/:id', getEarningById);

/**
 * @swagger
 * /earnings/{id}:
 *   put:
 *     summary: Actualizar un earning
 *     tags: [Earnings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del earning a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monto:
 *                 type: number
 *               descripcion:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Earning actualizado
 *       404:
 *         description: Earning no encontrado
 */
router.put('/:id', updateEarning);

/**
 * @swagger
 * /earnings/{id}:
 *   delete:
 *     summary: Eliminar un earning
 *     tags: [Earnings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del earning a eliminar
 *     responses:
 *       200:
 *         description: Earning eliminado
 *       404:
 *         description: Earning no encontrado
 */
router.delete('/:id', deleteEarning);

export default router;
