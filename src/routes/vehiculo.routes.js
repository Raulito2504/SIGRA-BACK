const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

// Middleware de autenticación
router.use(authMiddleware.authenticate);

// Rutas CRUD
router.get('/', vehiculoController.getAll);
router.post('/', validationMiddleware.validateVehiculo, vehiculoController.create);
router.get('/:id', vehiculoController.getById);
router.put('/:id', validationMiddleware.validateVehiculo, vehiculoController.update);
// router.patch('/:id', vehiculoController.partialUpdate); // Opcional - descomenta si implementas el método

// Rutas adicionales
router.get('/search', vehiculoController.search);
router.get('/stats', vehiculoController.getStats);
router.get('/flota', vehiculoController.getFlota);
router.get('/catalogs', vehiculoController.getCatalogs);
router.get('/polizas', vehiculoController.getWithPolizas);

// Documentos
router.post('/:id/documents', upload.single('documento'), vehiculoController.addDocument);
router.get('/:id/documents', vehiculoController.getDocuments);

module.exports = router;