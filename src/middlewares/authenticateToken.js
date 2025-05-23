import jwt from 'jsonwebtoken';
import initModels from '../models/init-models.js';
import { sequelizeDB } from '../database/connection.database.js';

// Inicializar modelos igual que en tus controllers
const models = initModels(sequelizeDB);
const Users = models.Users;
const Profiles = models.Profiles;

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Token not provided in the authorization header' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'newToken');
        const user = await Users.findByPk(decoded.id, {
            include: {
                model: Profiles,
                as: 'Profile',
                attributes: ['Nombre']
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profileName = user.Profile?.Nombre?.toLowerCase();

        req.userId = user.Id;
        req.userRole = profileName;

        const path = req.path.toLowerCase();

        // Acceso total para admin
        if (profileName === 'admin') {
            return next();
        }

        // Acceso solo a rutas de cliente para cliente
        if (profileName === 'cliente') {
            if (path.startsWith('/clients') ) {
                return next();
            }
            return res.status(403).json({ message: 'Access denied for client role' });
        }

        return res.status(403).json({ message: 'Access denied: unknown profile role' });

    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
