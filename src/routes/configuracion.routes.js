// src/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');

router.get('/', UsuarioController.getUsuarios);
router.post('/', UsuarioController.createUsuario);
router.put('/:id/estado', UsuarioController.updateEstado);
router.delete('/:id', UsuarioController.deleteUsuario);

module.exports = router;

