// src/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const validationMiddleware = require('../middleware/validation.middleware');


router.post('/register', validationMiddleware.validateRegister, usuarioController.register);

router.get('/', usuarioController.getAll);

router.put('/:id_usuario', usuarioController.update);

router.delete('/:id_usuario', usuarioController.delete);

module.exports = router;