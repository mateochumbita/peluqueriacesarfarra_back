import express from 'express';
import clientRoutes from './clients/routes.js'; // Importar las rutas de clientes
// Importa aquí las rutas de otros módulos cuando las tengas
import userRoutes from './users/routes.js'
import hairdresserRoutes from './hairdressers/routes.js'; // Importar las rutas de peluqueros
import profileRoutes from './profiles/routes.js'; // Importar las rutas de perfil
import appointmentRoutes from './appointments/routes.js'; // Importar las rutas de citas
import earningsRoutes from './earnings/routes.js'; // Importar las rutas de ganancias

import servicesRoutes from './services/routes.js'; // Importar las rutas de servicios
import hairdresserServicesRoutes from './hairdressers_services/routes.js'; // Importar las rutas de hairdressers_services
import authRoutes from './auth/routes.js'; // <--- Importa el router de auth

import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

// Asignar rutas de cada módulo a un endpoint general
router.use('/clients', authenticateToken, clientRoutes); // Middleware aplicado correctamente
router.use('/users', authenticateToken,userRoutes); // Rutas de usuarios
router.use('/hairdressers', authenticateToken, hairdresserRoutes); // Rutas de peluqueros
router.use('/profiles', authenticateToken, profileRoutes); // Rutas de perfil
router.use('/appointments', authenticateToken, appointmentRoutes); // Rutas de citas


//RUTAS LIBRES DE AUTHENTICACION
router.use('/auth', authRoutes); 

router.use('/earnings', authenticateToken, earningsRoutes); // Rutas de ganancias
router.use('/services', authenticateToken, servicesRoutes); // Rutas de servicios
router.use('/hairdressers-services', authenticateToken, hairdresserServicesRoutes); // Rutas de hairdressers_services

// router.use('/auth/logout', userRoutes.logout); // Rutas de cierre de sesión de usuarios


export default router;