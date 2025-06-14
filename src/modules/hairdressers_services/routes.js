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

/**
 * @swagger
 * tags:
 *   name: HairdresserServices
 *   description: Relación entre peluqueros y servicios
 */

/**
 * @swagger
 * /hairdresser_services:
 *   get:
 *     summary: Obtener todas las relaciones peluquero-servicio
 *     tags: [HairdresserServices]
 *     responses:
 *       200:
 *         description: Lista de relaciones obtenida correctamente
 */
router.get('/', getAllHairdresserServices);

/**
 * @swagger
 * /hairdresser_services/{id}:
 *   get:
 *     summary: Obtener una relación por ID
 *     tags: [HairdresserServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la relación
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relación encontrada
 *       404:
 *         description: Relación no encontrada
 */
router.get('/:id', getHairdresserServiceById);

/**
 * @swagger
 * /hairdresser_services:
 *   post:
 *     summary: Crear una nueva relación peluquero-servicio
 *     tags: [HairdresserServices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idHairdresser
 *               - idService
 *             properties:
 *               idHairdresser:
 *                 type: string
 *               idService:
 *                 type: string
 *     responses:
 *       201:
 *         description: Relación creada correctamente
 */
router.post('/', createHairdresserService);

/**
 * @swagger
 * /hairdresser_services/{id}:
 *   put:
 *     summary: Actualizar una relación peluquero-servicio
 *     tags: [HairdresserServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la relación a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idHairdresser:
 *                 type: string
 *               idService:
 *                 type: string
 *     responses:
 *       200:
 *         description: Relación actualizada correctamente
 *       404:
 *         description: Relación no encontrada
 */
router.put('/:id', updateHairdresserService);

/**
 * @swagger
 * /hairdresser_services/{id}:
 *   delete:
 *     summary: Eliminar una relación peluquero-servicio
 *     tags: [HairdresserServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la relación a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Relación eliminada correctamente
 *       404:
 *         description: Relación no encontrada
 */
router.delete('/:id', deleteHairdresserService);

/**
 * @swagger
 * /hairdresser_services/search:
 *   get:
 *     summary: Buscar relaciones con filtros (opcional)
 *     tags: [HairdresserServices]
 *     parameters:
 *       - in: query
 *         name: idHairdresser
 *         schema:
 *           type: string
 *         description: Filtrar por ID del peluquero
 *       - in: query
 *         name: idService
 *         schema:
 *           type: string
 *         description: Filtrar por ID del servicio
 *     responses:
 *       200:
 *         description: Resultados filtrados
 */
router.get('/search', searchHairdresserServices); // Solo si lo usás

export default router;
