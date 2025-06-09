const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario.model');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
    try {
        const { nombre_usuario, password } = req.body;

        // 1. Validar campos
        if (!nombre_usuario || !password) {
            return res.status(400).json({
                success: false,
                message: 'Usuario y contraseña requeridos'
            });
        }

        // 2. Buscar usuario
        const usuario = await Usuario.findByUsername(nombre_usuario);

        if (!usuario) {
            logger.warn(`Intento de login - Usuario no encontrado: ${nombre_usuario}`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // 3. Verificar contraseña
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            logger.warn(`Intento de login - Contraseña incorrecta para: ${nombre_usuario}`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // 4. Generar token
        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 5. Responder
        res.json({
            success: true,
            message: 'Autenticación exitosa',
            data: {
                token,
                usuario: {
                    id: usuario.id_usuario,
                    nombre: usuario.nombre_completo,
                    rol: usuario.rol
                }
            }
        });

    } catch (error) {
        logger.error(`Error en auth.controller: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
};