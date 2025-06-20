// src/routes/vehiculo.routes.js
const express = require('express');
const router = express.Router();

// ✅ Importaciones limpias y ordenadas
const vehiculoController = require('../controllers/vehiculo.controller');
const docsVehiculoController = require('../controllers/DocsVehiculos.controller');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

// ✅ Middleware de autenticación global para todas las rutas
router.use(authMiddleware.authenticate);

// ✅ Rutas específicas primero (más específicas antes que genéricas)
router.get('/search', vehiculoController.search);        
router.get('/stats', vehiculoController.getStats);
router.get('/flota', vehiculoController.getFlota);

// ✅ Rutas de pólizas globales que necesitan ir antes de las rutas con parámetros
router.get('/polizas/expiring', docsVehiculoController.getPolizasExpiringSoon);

// ✅ CRUD básico de vehículos
router.get('/', vehiculoController.getAll);
router.post('/', validationMiddleware.validateVehiculo, vehiculoController.create);
router.get('/:id', vehiculoController.getById);
router.put('/:id', validationMiddleware.validateVehiculo, vehiculoController.update);
router.delete('/:id', vehiculoController.delete);

// ========================================
// RUTAS PARA DOCUMENTOS GENERALES
// ========================================

/**
 * @route   GET /api/vehiculos/documents/tipos
 * @desc    Obtener tipos de documentos disponibles
 * @access  Private
 */
router.get('/documents/tipos', docsVehiculoController.getTiposDocumentos);

/**
 * @route   GET /api/vehiculos/:id/documents/stats
 * @desc    Obtener estadísticas de documentos del vehículo
 * @access  Private
 * @params  id: ID del vehículo
 */
router.get('/:id/documents/stats', docsVehiculoController.getEstadisticasDocumentos);

/**
 * @route   GET /api/vehiculos/:id/documents/resumen
 * @desc    Obtener resumen de documentos del vehículo
 * @access  Private
 * @params  id: ID del vehículo
 */
router.get('/:id/documents/resumen', docsVehiculoController.getResumenDocumentos);

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
    docsVehiculoController.addDocument
);

/**
 * @route   GET /api/vehiculos/:id/documents
 * @desc    Obtener todos los documentos de un vehículo
 * @access  Private
 * @params  id: ID del vehículo
 * @query   tipo: Filtrar por tipo de documento (opcional)
 */
router.get('/:id/documents', docsVehiculoController.getDocuments);

/**
 * @route   GET /api/vehiculos/:id/documents/:tipo
 * @desc    Obtener documentos por tipo específico
 * @access  Private
 * @params  id: ID del vehículo, tipo: Tipo de documento
 */
router.get('/:id/documents/:tipo', docsVehiculoController.getDocumentsByType);

/**
 * @route   GET /api/vehiculos/documents/:documentId/download
 * @desc    Descargar archivo de documento
 * @access  Private
 * @params  documentId: ID del documento
 */
router.get('/documents/:documentId/download', docsVehiculoController.downloadDocument);

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
    docsVehiculoController.updateDocument
);

/**
 * @route   DELETE /api/vehiculos/documents/:documentId
 * @desc    Eliminar documento del sistema
 * @access  Private
 * @params  documentId: ID del documento
 */
router.delete('/documents/:documentId', docsVehiculoController.deleteDocument);

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
    docsVehiculoController.addPoliza
);

/**
 * @route   GET /api/vehiculos/:id/polizas
 * @desc    Obtener todas las pólizas de un vehículo
 * @access  Private
 * @params  id: ID del vehículo
 * @query   activa: Filtrar por estado activo (true/false - opcional)
 */
router.get('/:id/polizas', docsVehiculoController.getPolizas);

/**
 * @route   GET /api/vehiculos/polizas/:polizaId/download
 * @desc    Descargar archivo de póliza
 * @access  Private
 * @params  polizaId: ID de la póliza
 */
router.get('/polizas/:polizaId/download', docsVehiculoController.downloadPoliza);

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
    docsVehiculoController.updatePoliza
);

/**
 * @route   DELETE /api/vehiculos/polizas/:polizaId
 * @desc    Eliminar póliza del sistema
 * @access  Private
 * @params  polizaId: ID de la póliza
 */
router.delete('/polizas/:polizaId', docsVehiculoController.deletePoliza);

module.exports = router;