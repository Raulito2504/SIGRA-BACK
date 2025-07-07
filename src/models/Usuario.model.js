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
            const hashedPassword = await bcrypt.hash(userData.password, 10);
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

    // Obtener todos los usuarios
    static async getAll() {
        try {
            const [rows] = await pool.execute('SELECT * FROM usuarios WHERE activo = TRUE');
            return rows;
        } catch (error) {
            logger.error(`Error al obtener usuarios: ${error.message}`);
            throw error;
        }
    }

    // Actualizar usuario
    static async update(id_usuario, userData) {
        try {
            const [result] = await pool.execute(
                'UPDATE usuarios SET nombre_usuario = ?, email = ?, nombre_completo = ?, id_rol = ? WHERE id_usuario = ? AND activo = TRUE',
                [
                    userData.nombre_usuario,
                    userData.email,
                    userData.nombre_completo,
                    userData.id_rol,
                    id_usuario
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar usuario: ${error.message}`);
            throw error;
        }
    }

    // Eliminar usuario (borrado lógico)
    static async delete(id_usuario) {
        try {
            const [result] = await pool.execute(
                'UPDATE usuarios SET activo = FALSE WHERE id_usuario = ?',
                [id_usuario]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al eliminar usuario: ${error.message}`);
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
}

module.exports = Usuario;