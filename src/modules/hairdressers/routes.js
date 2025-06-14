import express from 'express';
import { 
    createHairdresserWithUser, 
    getAllHairdressers, 
    getHairdresserById, 
    updateHairdresser, 
    deleteHairdresser, 
    searchHairdressers,
    getHairdreserByUserId
} from './controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hairdressers
 *   description: Endpoints para gestión de peluqueros
 */

/**
 * @swagger
 * /hairdressers:
 *   post:
 *     summary: Crear un nuevo peluquero (con usuario)
 *     tags: [Hairdressers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - usuario
 *             properties:
 *               nombre:
 *                 type: string
 *               usuario:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       201:
 *         description: Peluquero creado correctamente
 */
router.post('/', createHairdresserWithUser);

/**
 * @swagger
 * /hairdressers:
 *   get:
 *     summary: Obtener todos los peluqueros
 *     tags: [Hairdressers]
 *     responses:
 *       200:
 *         description: Lista de peluqueros obtenida correctamente
 */
router.get('/', getAllHairdressers);

/**
 * @swagger
 * /hairdressers/search:
 *   get:
 *     summary: Buscar peluqueros con filtros
 *     tags: [Hairdressers]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del peluquero
 *     responses:
 *       200:
 *         description: Resultados de la búsqueda
 */
router.get('/search', searchHairdressers);

/**
 * @swagger
 * /hairdressers/user/{idUser}:
 *   get:
 *     summary: Obtener peluquero por ID de usuario
 *     tags: [Hairdressers]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario relacionado
 *     responses:
 *       200:
 *         description: Peluquero encontrado
 *       404:
 *         description: Peluquero no encontrado
 */
router.get('/user/:idUser', getHairdreserByUserId);

/**
 * @swagger
 * /hairdressers/{id}:
 *   get:
 *     summary: Obtener peluquero por ID
 *     tags: [Hairdressers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del peluquero
 *     responses:
 *       200:
 *         description: Peluquero encontrado
 *       404:
 *         description: Peluquero no encontrado
 */
router.get('/:id', getHairdresserById);

/**
 * @swagger
 * /hairdressers/{id}:
 *   put:
 *     summary: Actualizar un peluquero
 *     tags: [Hairdressers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del peluquero a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Peluquero actualizado
 *       404:
 *         description: Peluquero no encontrado
 */
router.put('/:id', updateHairdresser);

/**
 * @swagger
 * /hairdressers/{id}:
 *   delete:
 *     summary: Eliminar un peluquero
 *     tags: [Hairdressers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del peluquero a eliminar
 *     responses:
 *       200:
 *         description: Peluquero eliminado
 *       404:
 *         description: Peluquero no encontrado
 */
router.delete('/:id', deleteHairdresser);

export default router;
