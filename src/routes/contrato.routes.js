// src/routes/contrato.routes.js
const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contrato.controller');
const authMiddleware = require('../middleware/auth.middleware');
const contratoValidation = require('../middleware/contrato.validation');

// Middleware global para autenticación
router.use(authMiddleware.authenticate);

/**
 * @route   POST /api/contratos
 * @desc    Crear nuevo contrato
 * @access  Private
 */
router.post('/', contratoValidation.create, contratoController.createContrato);

/**
 * @route   GET /api/contratos
 * @desc    Listar contratos
 * @access  Private
 */
router.get('/', contratoController.getAllContratos);

/**
 * @route   GET /api/contratos/:id
 * @desc    Obtener contrato por ID
 * @access  Private
 */
router.get('/:id', contratoController.getContratoById);

/**
 * @route   PUT /api/contratos/:id/status
 * @desc    Cambiar estado del contrato
 * @access  Private
 */
router.put('/:id/status', contratoValidation.updateStatus, contratoController.updateContratoStatus);

/**
 * @route   DELETE /api/contratos/:id
 * @desc    Eliminar contrato
 * @access  Private
 */
router.delete('/:id', contratoController.deleteContrato);

module.exports = router;