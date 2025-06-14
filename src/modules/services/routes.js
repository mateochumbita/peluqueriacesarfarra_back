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

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Gestión de servicios de peluquería
 */

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags: [Servicios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 */
router.post('/', createService);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtener todos los servicios
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /services/search:
 *   get:
 *     summary: Buscar servicios con filtros
 *     tags: [Servicios]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: Precio máximo
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/search', searchServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', getServiceById);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Actualizar un servicio por ID
 *     tags: [Servicios]
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
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200:
 *         description: Servicio actualizado
 */
router.put('/:id', updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Eliminar un servicio por ID
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente
 */
router.delete('/:id', deleteService);

export default router;
