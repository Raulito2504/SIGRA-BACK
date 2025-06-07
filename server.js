require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { createServer } = require('http');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');

// Validar variables de entorno críticas
const requiredEnv = ['PORT', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
    logger.error(`❌ Faltan variables de entorno: ${missingEnv.join(', ')}`);
    process.exit(1);
}

// Crear aplicación Express
const app = express();
const server = createServer(app);

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Importar rutas
const vehiculoRoutes = require('./src/routes/vehiculo.routes');
const authRoutes = require('./src/routes/auth.routes');

// Rutas base
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido al API de SIGRA-BACK',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    logger.error(`Error no manejado: ${err.message}`);
    if (res.headersSent) return next(err);

    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Puerto del servidor
const PORT = process.env.PORT || 4000;

// Iniciar servidor después de conectar a la base de datos
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            logger.info(`=================================`);
            logger.info(`🚀 Servidor iniciado en el puerto ${PORT}`);
            logger.info(`=================================`);
            logger.info(`🛢  Entorno: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🛢  Base de datos: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
            logger.info(`🔒 Autenticación JWT: Configurada`);
            logger.info(`🌐 URL: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        logger.error('❌ No se pudo iniciar la aplicación:');
        logger.error(error);
        process.exit(1);
    });

module.exports = app;
