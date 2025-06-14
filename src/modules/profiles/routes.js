import express from 'express';
import { 
    createProfile, 
    getAllProfiles, 
    getProfileById, 
    updateProfile, 
    deleteProfile, 
    searchProfiles 
} from './controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profiles
 *   description: Gestión de perfiles de usuario
 */

/**
 * @swagger
 * /profiles:
 *   post:
 *     summary: Crear un nuevo perfil
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perfil creado correctamente
 */
router.post('/', createProfile);

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Obtener todos los perfiles
 *     tags: [Profiles]
 *     responses:
 *       200:
 *         description: Lista de perfiles obtenida correctamente
 */
router.get('/', getAllProfiles);

/**
 * @swagger
 * /profiles/search:
 *   get:
 *     summary: Buscar perfiles con filtros
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre
 *     responses:
 *       200:
 *         description: Lista de perfiles filtrada
 */
router.get('/search', searchProfiles);

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Obtener un perfil por ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del perfil
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       404:
 *         description: Perfil no encontrado
 */
router.get('/:id', getProfileById);

/**
 * @swagger
 * /profiles/{id}:
 *   put:
 *     summary: Actualizar un perfil
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del perfil a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       404:
 *         description: Perfil no encontrado
 */
router.put('/:id', updateProfile);

/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     summary: Eliminar un perfil
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del perfil a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil eliminado correctamente
 *       404:
 *         description: Perfil no encontrado
 */
router.delete('/:id', deleteProfile);

export default router;
