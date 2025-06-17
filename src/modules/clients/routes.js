import express from 'express';
import { 
  createClient, 
  getAllClients, 
  getAllDisabledClients,
  getClientById, 
  updateClient, 
  deleteClient, 
  searchClients,
  getClientsStats,
  getClientByUserId
} from './controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Endpoints para la gestión de clientes
 */

/**
 * @swagger
 * /clients/stats:
 *   get:
 *     summary: Obtener estadísticas de clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Estadísticas de clientes obtenidas correctamente
 */
router.get('/stats', getClientsStats);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Obtener todos los clientes habilitados
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/', getAllClients);

/**
 * @swagger
 * /clients/disabled:
 *   get:
 *     summary: Obtener todos los clientes deshabilitados
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes deshabilitados obtenida correctamente
 */
router.get('/disabled', getAllDisabledClients);

/**
 * @swagger
 * /clients/search:
 *   get:
 *     summary: Buscar clientes con filtros
 *     tags: [Clientes]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del cliente a buscar
 *     responses:
 *       200:
 *         description: Lista de clientes filtrados
 */
router.get('/search', searchClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', getClientById);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - telefono
 *               - email
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *       400:
 *         description: Error al crear el cliente
 */
router.post('/', createClient);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Actualizar un cliente existente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a eliminar
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', deleteClient);

/**
 * @swagger
 * /clients/user/{idUser}:
 *   get:
 *     summary: Obtener cliente por ID de usuario
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: idUser
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario asociado al cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado por ID de usuario
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/user/:idUser', getClientByUserId);

export default router;
