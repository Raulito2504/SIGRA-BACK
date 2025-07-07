// src/config/multer.config.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const ensureUploadDirAsync = async (uploadDir) => {
    try {
        await fs.promises.access(uploadDir, fs.constants.F_OK);
    } catch (error) {
        try {
            await fs.promises.mkdir(uploadDir, { recursive: true });
        } catch (mkdirError) {
            logger.error(`No se pudo crear la carpeta uploads: ${mkdirError.message}`);
            throw new Error('No se pudo crear el directorio de subidas');
        }
    }
};

const ensureUploadDir = (uploadDir) => {
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        return true;
    } catch (error) {
        logger.error(`No se pudo crear la carpeta uploads: ${error.message}`);
        return false;
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/file');
        
        // Usando la versión síncrona (recomendada para Multer)
        if (ensureUploadDir(uploadDir)) {
            cb(null, uploadDir);
        } else {
            cb(new Error('No se pudo crear el directorio de subidas'));
        }
        
        
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedFilename = file.originalname.replace(/[^a-z0-9._-]/gi, '_');
        cb(null, `${file.fieldname}-${uniqueSuffix}-${sanitizedFilename}`);
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

    
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Solo se permiten archivos PDF, JPEG o PNG'));
    }

    
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Extensión no permitida'));
    }

    cb(null, true);
};


const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Máximo 1 archivo por solicitud
    }
});

module.exports = upload;