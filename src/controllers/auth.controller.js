const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Iniciar sesión
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

        // Generar token JWT
        const token = jwt.sign(
            {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                rol: usuario.id_rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

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

// Registro de usuario (opcional)
exports.register = async (req, res) => {
    const { nombre_usuario, email, password, nombre_completo, id_rol } = req.body;

    try {
        // Verificar si el usuario o email ya existen
        const existingUser = await Usuario.findByUsername(nombre_usuario);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        const existingEmail = await Usuario.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está en uso'
            });
        }

        // Crear nuevo usuario
        const userId = await Usuario.create({
            nombre_usuario,
            email,
            password,
            nombre_completo,
            id_rol
        });

        // Devolver respuesta
        const nuevoUsuario = await Usuario.findByUsername(nombre_usuario);
        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            data: { usuario: nuevoUsuario }
        });
    } catch (error) {
        logger.error(`Error en registro: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};