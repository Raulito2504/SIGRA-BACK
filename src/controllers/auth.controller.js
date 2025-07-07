// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');


exports.login = async (req, res) => {
    const { nombre_usuario, password } = req.body;

    try {
        // Buscar usuario por nombre de usuario
        const usuario = await Usuario.findByUsername(nombre_usuario);
        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isValid = await bcrypt.compare(password, usuario.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        
        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                rol: usuario.id_rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Responder con token y datos del usuario
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre_usuario: usuario.nombre_usuario,
                    nombre_completo: usuario.nombre_completo,
                    rol: usuario.id_rol
                }
            }
        });
    } catch (error) {
        logger.error(`Error en login: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

