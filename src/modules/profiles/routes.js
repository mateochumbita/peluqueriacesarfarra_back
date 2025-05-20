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

// Rutas para los perfiles
router.post('/', createProfile); // Crear un perfil
router.get('/', getAllProfiles); // Obtener todos los perfiles
router.get('/search', searchProfiles); // Buscar perfiles con filtros
router.get('/:id', getProfileById); // Obtener un perfil por ID
router.put('/:id', updateProfile); // Actualizar un perfil
router.delete('/:id', deleteProfile); // Eliminar un perfil

export default router;