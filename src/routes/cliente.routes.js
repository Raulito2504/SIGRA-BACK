// src/routes/clientes.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const authMiddleware = require('../middleware/auth.middleware');
const clienteValidation = require('../middleware/cliente.validation');

// Middleware global para autenticación
router.use(authMiddleware.authenticate);

/**
 * @route   GET /api/clientes/search
 * @desc    Buscar clientes existentes
 * @access  Private
 */
router.get('/search', clienteValidation.search, clienteController.searchClientes);

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Private
 */
router.post('/', clienteValidation.create, clienteController.createCliente);

module.exports = router;