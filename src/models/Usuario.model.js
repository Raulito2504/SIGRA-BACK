// src/models/usuario.model.js
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

class Usuario {
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

    static async create({ nombre_usuario, email, password, nombre_completo, id_rol }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await pool.execute(
                'INSERT INTO usuarios (nombre_usuario, email, password, nombre_completo, id_rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
                [nombre_usuario, email, hashedPassword, nombre_completo, id_rol, true]
            );

            const [rows] = await pool.execute(
                'SELECT * FROM usuarios WHERE id_usuario = ?',
                [result.insertId]
            );

            return rows[0];
        } catch (error) {
            logger.error(`Error al crear usuario: ${error.message}`);
            throw error;
        }
    }

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

    static async getAll() {
        try {
            const [rows] = await pool.execute(`
                SELECT u.id_usuario, u.nombre_usuario, u.email, u.nombre_completo, u.activo, r.nombre AS rol
                FROM usuarios u
                JOIN roles r ON u.id_rol = r.id
            `);
            return rows;
        } catch (error) {
            logger.error(`Error al obtener usuarios: ${error.message}`);
            throw error;
        }
    }

    static async updateEstado(id_usuario, activo) {
        try {
            const [result] = await pool.execute(
                'UPDATE usuarios SET activo = ? WHERE id_usuario = ?',
                [activo, id_usuario]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al cambiar estado del usuario: ${error.message}`);
            throw error;
        }
    }

    static async delete(id_usuario) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM usuarios WHERE id_usuario = ?',
                [id_usuario]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al eliminar usuario: ${error.message}`);
            throw error;
        }
    }

    static async usernameExists(username) {
        try {
            const [rows] = await pool.execute(
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
