// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario.model');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
    try {
        // Datos de prueba (deberás reemplazar esto con tu lógica real)
        const testUser = {
            id: 1,
            nombre_usuario: 'admin',
            nombre_completo: 'Administrador',
            rol: 'admin'
        };

        // Generar token
        const token = jwt.sign(
            {
                id: testUser.id,
                nombre: testUser.nombre_completo,
                rol: testUser.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login exitoso (modo prueba)',
            data: {
                token,
                usuario: testUser
            }
        });

    } catch (error) {
        logger.error(`Error en login: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};