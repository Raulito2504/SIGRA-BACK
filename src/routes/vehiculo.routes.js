// src/routes/vehiculo.routes.js
const express = require('express');
const router = express.Router();


const vehiculoController = require('../controllers/vehiculo.controller');
const docsVehiculoController = require('../controllers/DocsVehiculos.controller');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');


router.use(authMiddleware.authenticate);

router.get('/search', vehiculoController.search);        
router.get('/stats', vehiculoController.getStats);
router.get('/flota', vehiculoController.getFlota);

router.get('/polizas/expiring', docsVehiculoController.getPolizasExpiringSoon);

router.get('/', vehiculoController.getAll);
router.post('/', validationMiddleware.validateVehiculo, vehiculoController.create);
router.get('/:id', vehiculoController.getById);
router.put('/:id', validationMiddleware.validateVehiculo, vehiculoController.update);
router.delete('/:id', vehiculoController.delete);

========================================

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/documents/tipos', docsVehiculoController.getTiposDocumentos);

/**
 * @route   
 * @desc    
 * @access  
 * @params  
 */
router.get('/:id/documents/stats', docsVehiculoController.getEstadisticasDocumentos);

/**
 * @route   
 * @desc    
 * @access  
 * @params  
 */
router.get('/:id/documents/resumen', docsVehiculoController.getResumenDocumentos);

/**
 * @route   
 * @desc    
 * @access  
 * @params  
 * @body    
 */
router.post(
    '/:id/documents',
    upload.single('documento'),
    validationMiddleware.validarDocumento,
    docsVehiculoController.addDocument
);

/**
 * @route  
 * @desc    
 * @access  
 * @params  
 * @query  
 */
router.get('/:id/documents', docsVehiculoController.getDocuments);

/**
 * @route   
 * @desc   
 * @access 
 * @params  
 */
router.get('/:id/documents/:tipo', docsVehiculoController.getDocumentsByType);

/**
 * @route  
 * @desc    
 * @access  
 * @params  
 */
router.get('/documents/:documentId/download', docsVehiculoController.downloadDocument);

/**
 * @route   
 * @desc    
 * @access 
 * @params  
 * @body   
 */
router.put(
    '/documents/:documentId',
    upload.single('documento'),
    docsVehiculoController.updateDocument
);

/**
 * @route  
 * @desc    
 * @params  
 */
router.delete('/documents/:documentId', docsVehiculoController.deleteDocument);

// ========================================
// RUTAS PARA PÓLIZAS DE SEGURO
// ========================================

/**
 * @route   
 * @desc    
 * @access 
 * @params  
 * @body    
 */
router.post(
    '/:id/polizas',
    upload.single('poliza'),
    validationMiddleware.validarPoliza,
    docsVehiculoController.addPoliza
);

/**
 * @route  
 * @desc    
 * @access  
 * @params  
 * @query  
 */
router.get('/:id/polizas', docsVehiculoController.getPolizas);

/**
 * @route   
 * @desc
 * @access 
 * @params  
 */
router.get('/polizas/:polizaId/download', docsVehiculoController.downloadPoliza);

/**
 * @route   
 * @desc    
 * @access 
 * @params  
 * @body   
 */
router.put(
    '/polizas/:polizaId',
    upload.single('poliza'),
    validationMiddleware.validarPoliza,
    docsVehiculoController.updatePoliza
);

/**
 * @route  
 * @desc  
 * @access  
 * @params 
 */
router.delete('/polizas/:polizaId', docsVehiculoController.deletePoliza);

module.exports = router;