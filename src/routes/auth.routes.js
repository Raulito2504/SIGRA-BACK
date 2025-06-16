// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middleware/validation.middleware');

// Ruta de inicio de sesión
router.post('/login', authController.login);

// Ruta de registro (opcional)
router.post('/register', validationMiddleware.validateRegister, authController.register);

module.exports = router;