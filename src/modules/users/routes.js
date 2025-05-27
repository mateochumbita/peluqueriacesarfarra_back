import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
} from './controller.js';

const router = express.Router();
//jijamagica


router.get('/', getAllUsers); // Obtener todos los usuarios
router.get('/:id', getUserById); // Obtener un usuario por ID
router.put('/:id', updateUser); // Actualizar un usuario
router.delete('/:id', deleteUser); // Eliminar un usuario
router.get('/search', searchUsers); // Buscar usuarios

export default router;
