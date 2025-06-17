const db = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class Usuario {
    static async findByUsername(username) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE nombre_usuario = ?',
                [username]
            );
            return rows[0];
        } catch (error) {
            logger.error(`Error en Usuario.findByUsername: ${error.message}`);
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