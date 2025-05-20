import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
} from './controller.js';

const router = express.Router();

// Rutas para los usuarios
router.post('/register', registerUser); // Registro de usuarios
router.post('/login', loginUser); // Inicio de sesión
router.post('/logout', logoutUser); // Cierre de sesión
router.get('/', getAllUsers); // Obtener todos los usuarios
router.get('/:id', getUserById); // Obtener un usuario por ID
router.put('/:id', updateUser); // Actualizar un usuario
router.delete('/:id', deleteUser); // Eliminar un usuario
router.get('/search', searchUsers); // Buscar usuarios

export default router;
