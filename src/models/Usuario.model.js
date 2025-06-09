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
}

module.exports = Usuario;