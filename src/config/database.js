// src/config/database.js
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function connectDB() {
    try {
        const connection = await pool.getConnection();
        logger.info('🛢  Conexión a la base de datos establecida correctamente');
        connection.release();
        return pool;
    } catch (error) {
        logger.error('❌ Error al conectar a la base de datos:');
        logger.error(error.message);
        throw error;
    }
}

// Función helper para ejecutar queries fácilmente
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        logger.error('Error en query:', error);
        throw error;
    }
}

module.exports = {
    pool,
    connectDB,
    query  
};