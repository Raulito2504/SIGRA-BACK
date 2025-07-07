// src/routes/cliente.routes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { authenticate } = require('../middleware/auth.middleware');
const clienteValidation = require('../middleware/cliente.validation');

// Proteger todas las rutas con JWT
router.use(authenticate);


router.post('/', clienteValidation.create, clienteController.createCliente);

router.get('/', clienteController.getAllClientes);

router.get('/:id', clienteController.getClienteById);

router.put('/:id', clienteValidation.create, clienteController.updateCliente);

router.delete('/:id', clienteController.deleteCliente);

module.exports = router;