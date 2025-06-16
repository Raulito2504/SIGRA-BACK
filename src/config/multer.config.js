// src/config/multer.config.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        try {
            await fs.access(uploadDir, fs.constants.F_OK);
        } catch (error) {
            try {
                await fs.mkdir(uploadDir, { recursive: true });
            } catch (mkdirError) {
                logger.error(`No se pudo crear la carpeta uploads: ${mkdirError.message}`);
                return cb(new Error('No se pudo crear el directorio de subidas'));
            }
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-z0-9._-]/gi, '_');
        cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedFilename}`);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

    // Validar tipo MIME
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Solo se permiten archivos PDF, JPEG o PNG'));
    }

    // Validar extensión
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Extensión no permitida'));
    }

    cb(null, true);
};

// Configuración final de multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Máximo 1 archivo por solicitud
    }
});

module.exports = upload;