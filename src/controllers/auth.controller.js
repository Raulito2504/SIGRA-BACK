const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario.model');
const logger = require('../utils/logger');
//Login
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
//Registro

exports.register = async (req, res) => {
    try {
        // Normalizar el nombre del campo (acepta ambas versiones)
        const nombre_usuario = req.body.nombre_usuario || req.body["nombre usuario"];
        
        const { password, nombre_completo, email, id_rol } = req.body;

        // Validación exhaustiva
        if (!nombre_usuario || !password || !nombre_completo || !email || !id_rol) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: nombre_usuario, password, nombre_completo, email, id_rol',
                received_data: req.body // Para debug
            });
        }

        // Verificar si el usuario ya existe
        const [existingUser] = await db.query(
            'SELECT id_usuario FROM usuarios WHERE nombre_usuario = ? OR email = ?', 
            [nombre_usuario, email]
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El usuario o email ya está registrado'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar nuevo usuario
        const [result] = await db.query(
            `INSERT INTO usuarios 
            (nombre_usuario, password, nombre_completo, email, id_rol, activo) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre_usuario, hashedPassword, nombre_completo, email, id_rol, 1]
        );

        // Generar token
        const token = jwt.sign(
            { id: result.insertId, email, rol: id_rol },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                token,
                usuario: {
                    id: result.insertId,
                    nombre_usuario,
                    nombre_completo,
                    email,
                    rol: id_rol
                }
            }
        });

    } catch (error) {
        logger.error('Error en registro:', error);
        console.error('Detalle completo:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error_details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                sql_error: error.sqlMessage,
                code: error.code
            } : undefined
        });
    }
};