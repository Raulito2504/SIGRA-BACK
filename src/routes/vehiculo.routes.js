// src/routes/vehiculo.routes.js
const express = require('express');
const router = express.Router();

// ✅ Importa el controlador
const vehiculoController = require('../controllers/vehiculo.controller');

// ✅ Importa middleware faltante
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

// Middleware de autenticación
router.use(authMiddleware.authenticate);

// ✅ Rutas específicas
router.get('/search', vehiculoController.search);        // ← Línea 15
router.get('/stats', vehiculoController.getStats);
router.get('/flota', vehiculoController.getFlota);
router.get('/polizas', vehiculoController.getWithPolizas);

// ✅ CRUD
router.get('/', vehiculoController.getAll);
router.post('/', validationMiddleware.validateVehiculo, vehiculoController.create);
router.put('/:id', validationMiddleware.validateVehiculo, vehiculoController.update);
router.get('/:id', vehiculoController.getById);
router.delete('/:id', vehiculoController.delete);

// ✅ Documentos
router.post('/:id/documents', 
    validationMiddleware.validateDocument, 
    upload.single('documento'), 
    vehiculoController.addDocument
);
router.get('/:id/documents', vehiculoController.getDocuments);

module.exports = router;