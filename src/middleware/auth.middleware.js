//src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = {
    authenticate: (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            logger.warn('Intento de acceso sin token');
            return res.status(401).json({
                success: false,
                message: 'Acceso no autorizado. Token requerido'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            logger.error(`Error de autenticación: ${error.message}`);
            res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
    }
};