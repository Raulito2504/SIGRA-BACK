// src/routes/vehiculo.routes.js
const express = require('express');
const router = express.Router();

// ✅ Importaciones limpias y ordenadas
const vehiculocontroller = require('../controllers/vehiculo.controller');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

// ✅ Middleware de autenticación global para todas las rutas
router.use(authMiddleware.authenticate);

// ✅ Rutas específicas primero (más específicas antes que genéricas)
router.get('/search', vehiculocontroller.search);        
router.get('/stats', vehiculocontroller.getStats);
router.get('/flota', vehiculocontroller.getFlota);

// ✅ Rutas de pólizas que necesitan ir antes de las rutas con parámetros
router.get('/polizas/expiring', vehiculocontroller.getPolizasExpiringSoon);

// ✅ CRUD básico de vehículos
router.get('/', vehiculocontroller.getAll);
router.post('/', validationMiddleware.validateVehiculo, vehiculocontroller.create);
router.get('/:id', vehiculocontroller.getById);
router.put('/:id', validationMiddleware.validateVehiculo, vehiculocontroller.update);
router.delete('/:id', vehiculocontroller.delete);

// ========================================
// RUTAS PARA DOCUMENTOS GENERALES
// ========================================

/**
 * @route   GET /api/vehiculos/:id/documents/stats
 * @desc    Obtener estadísticas de documentos del vehículo
 * @access  Private
 * @params  id: ID del vehículo
 */
router.get('/:id/documents/stats', vehiculocontroller.getEstadisticasDocumentos);

/**
 * @route   POST /api/vehiculos/:id/documents
 * @desc    Subir documento general al vehículo
 * @access  Private
 * @params  id: ID del vehículo
 * @body    tipo_documento, descripcion, documento (file)
 */
router.post(
    '/:id/documents',
    upload.single('documento'),
    validationMiddleware.validarDocumento,
    vehiculocontroller.addDocument
);

/**
 * @route   GET /api/vehiculos/:id/documents
 * @desc    Obtener todos los documentos de un vehículo
 * @access  Private
 * @params  id: ID del vehículo
 * @query   tipo: Filtrar por tipo de documento (opcional)
 */
router.get('/:id/documents', vehiculocontroller.getDocuments);

/**
 * @route   GET /api/vehiculos/:id/documents/:tipo
 * @desc    Obtener documentos por tipo específico
 * @access  Private
 * @params  id: ID del vehículo, tipo: Tipo de documento
 */
router.get('/:id/documents/:tipo', vehiculocontroller.getDocumentsByType);

/**
 * @route   GET /api/vehiculos/documents/:documentId/download
 * @desc    Descargar archivo de documento
 * @access  Private
 * @params  documentId: ID del documento
 */
router.get('/documents/:documentId/download', vehiculocontroller.downloadDocument);

/**
 * @route   PUT /api/vehiculos/documents/:documentId
 * @desc    Actualizar documento existente
 * @access  Private
 * @params  documentId: ID del documento
 * @body    tipo_documento, descripcion, documento (file - opcional)
 */
router.put(
    '/documents/:documentId',
    upload.single('documento'),
    validationMiddleware.validarDocumento,
    vehiculocontroller.updateDocument
);

/**
 * @route   DELETE /api/vehiculos/documents/:documentId
 * @desc    Eliminar documento del sistema
 * @access  Private
 * @params  documentId: ID del documento
 */
router.delete('/documents/:documentId', vehiculocontroller.deleteDocument);

// ========================================
// RUTAS PARA PÓLIZAS DE SEGURO
// ========================================

/**
 * @route   POST /api/vehiculos/:id/polizas
 * @desc    Crear nueva póliza de seguro
 * @access  Private
 * @params  id: ID del vehículo
 * @body    Datos completos de la póliza + archivo (opcional)
 */
router.post(
    '/:id/polizas',
    upload.single('poliza'),
    validationMiddleware.validarPoliza,
    vehiculocontroller.addPoliza
);

/**
 * @route   GET /api/vehiculos/:id/polizas
 * @desc    Obtener todas las pólizas de un vehículo
 * @access  Private
 * @params  id: ID del vehículo
 * @query   activa: Filtrar por estado activo (true/false - opcional)
 */
router.get('/:id/polizas', vehiculocontroller.getPolizas);

/**
 * @route   GET /api/vehiculos/polizas/:polizaId/download
 * @desc    Descargar archivo de póliza
 * @access  Private
 * @params  polizaId: ID de la póliza
 */
router.get('/polizas/:polizaId/download', vehiculocontroller.downloadPoliza);

/**
 * @route   PUT /api/vehiculos/polizas/:polizaId
 * @desc    Actualizar póliza existente
 * @access  Private
 * @params  polizaId: ID de la póliza
 * @body    Datos de la póliza + archivo (opcional)
 */
router.put(
    '/polizas/:polizaId',
    upload.single('poliza'),
    validationMiddleware.validarPoliza,
    vehiculocontroller.updatePoliza
);

/**
 * @route   DELETE /api/vehiculos/polizas/:polizaId
 * @desc    Eliminar póliza del sistema
 * @access  Private
 * @params  polizaId: ID de la póliza
 */
router.delete('/polizas/:polizaId', vehiculocontroller.deletePoliza);

module.exports = router;