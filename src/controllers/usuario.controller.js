// src/controllers/usuario.controller.js
const Usuario = require('../models/Usuario.model');
const logger = require('../utils/logger');

// Registrar usuario
exports.register = async (req, res) => {
    const { nombre_usuario, email, password, nombre_completo, id_rol } = req.body;

    try {
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

        await Usuario.create({
            nombre_usuario,
            email,
            password,
            nombre_completo,
            id_rol
        });

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

// Listar todos los usuarios
exports.getAll = async (req, res) => {
    try {
        const usuarios = await Usuario.getAll();
        res.json({
            success: true,
            data: usuarios
        });
    } catch (error) {
        logger.error(`Error al obtener usuarios: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};

// Actualizar usuario
exports.update = async (req, res) => {
    const { id_usuario } = req.params;
    const { nombre_usuario, email, nombre_completo, id_rol } = req.body;

    try {
        const result = await Usuario.update(id_usuario, {
            nombre_usuario,
            email,
            nombre_completo,
            id_rol
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario actualizado correctamente'
        });
    } catch (error) {
        logger.error(`Error al actualizar usuario: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario'
        });
    }
};

// Eliminar usuario
exports.delete = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const result = await Usuario.delete(id_usuario);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch (error) {
        logger.error(`Error al eliminar usuario: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario'
        });
    }
};