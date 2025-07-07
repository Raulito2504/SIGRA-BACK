// src/routes/contrato.routes.js
const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contrato.controller');
const authMiddleware = require('../middleware/auth.middleware');
const contratoValidation = require('../middleware/contrato.validation');

router.use(authMiddleware.authenticate);

/**
 * @route   
 * @desc    
 * @access  
 */
router.post('/', contratoValidation.create, contratoController.createContrato);

/**
 * @route   
 * @desc   
 * @access 
 */
router.get('/', contratoController.getAllContratos);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/:id', contratoController.getContratoById);

/**
 * @route   
 * @desc    
 * @access  
 */
router.put('/:id/status', contratoValidation.updateStatus, contratoController.updateContratoStatus);

/**
 * @route   
 * @desc    
 * @access  P
 */
router.delete('/:id', contratoController.deleteContrato);

// src/routes/contrato.routes.js
router.get('/:id/pdf', contratoController.downloadContratoPDF);

module.exports = router;