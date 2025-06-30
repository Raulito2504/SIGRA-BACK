const { pool } = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

class Usuario {
    // Buscar usuario por nombre de usuario
    static async findByUsername(nombre_usuario) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = TRUE',
                [nombre_usuario]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`Error al buscar usuario por nombre: ${error.message}`);
            throw error;
        }
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`Error al buscar usuario por email: ${error.message}`);
            throw error;
        }
    }

    // Crear un nuevo usuario
    static async create(userData) {
        try {
            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Insertar en la base de datos
            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre_usuario, email, password, nombre_completo, id_rol) VALUES (?, ?, ?, ?, ?)',
                [
                    userData.nombre_usuario,
                    userData.email,
                    hashedPassword,
                    userData.nombre_completo,
                    userData.id_rol
                ]
            );

            return result.insertId;
        } catch (error) {
            logger.error(`Error al crear usuario: ${error.message}`);
            throw error;
        }
    }

    // Actualizar contraseña
    static async updatePassword(id_usuario, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [result] = await pool.execute(
                'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
                [hashedPassword, id_usuario]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar contraseña: ${error.message}`);
            throw error;
        }
    }

    // Obtener todos los usuarios (opcional)
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM usuarios');
            return rows;
        } catch (error) {
            logger.error(`Error al obtener usuarios: ${error.message}`);
            throw error;
        }
    }

    static async create({ nombre_usuario, password, nombre_completo, id_rol }) {
        try {
            // Hash de la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const [result] = await db.query(
                'INSERT INTO usuarios (nombre_usuario, password, nombre_completo, id_rol, activo) VALUES (?, ?, ?, ?, ?)',
                [nombre_usuario, hashedPassword, nombre_completo, id_rol, true]
            );

            // Obtener el usuario recién creado
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE id_usuario = ?',
                [result.insertId]
            );

            return rows[0];
        } catch (error) {
            logger.error(`Error en Usuario.create: ${error.message}`);
            throw error;
        }
    }

    static async usernameExists(username) {
        try {
            const [rows] = await db.query(
                'SELECT id_usuario FROM usuarios WHERE nombre_usuario = ?',
                [username]
            );
            return rows.length > 0;
        } catch (error) {
            logger.error(`Error en Usuario.usernameExists: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Usuario;