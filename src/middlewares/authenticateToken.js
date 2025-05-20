import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers['authorization'];

    // Verificar si el encabezado de autorización está presente
    if (!authHeader) {
        return res.status(403).json({ message: 'Authorization header is missing' });
    }

    // El token puede venir como "Bearer <token>", extraemos solo el token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token not provided in the authorization header' });
    }

    // Verificar y decodificar el token
    jwt.verify(token, process.env.JWT_SECRET || 'newToken', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Agregar información del usuario al objeto `req`
        req.userId = decoded.id;
        req.userRole = decoded.role || null; // Si se usa el rol en el token
        next();
    });
};
