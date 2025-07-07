const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Cliente {
    // Crear un nuevo cliente
    static async create(clienteData) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO clientes (nombre_completo, domicilio_hotel, ciudad, telefono, licencia_conducir, correo_electronico)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    clienteData.nombre_completo,
                    clienteData.domicilio_hotel,
                    clienteData.ciudad,
                    clienteData.telefono,
                    clienteData.licencia_conducir,
                    clienteData.correo_electronico
                ]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`Error al crear cliente: ${error.message}`);
            throw error;
        }
    }

    // Obtener todos los clientes (con paginación y búsqueda opcional)
    static async getAll({ page = 1, limit = 10, filters = {} }) {
        try {
            const pageNum = Number(page) > 0 ? Number(page) : 1;
            const limitNum = Number(limit) > 0 ? Number(limit) : 10;
            const offset = (pageNum - 1) * limitNum;
            
            // Construir consulta base
            let query = 'SELECT * FROM clientes WHERE activo = TRUE';
            let countQuery = 'SELECT COUNT(*) as count FROM clientes WHERE activo = TRUE';
            let params = [];

            // Solo agregar filtros si realmente existen y tienen contenido
            if (filters && typeof filters === 'object') {
                if (filters.nombre && typeof filters.nombre === 'string' && filters.nombre.trim()) {
                    query += ' AND nombre_completo LIKE ?';
                    countQuery += ' AND nombre_completo LIKE ?';
                    params.push(`%${filters.nombre.trim()}%`);
                }
                if (filters.telefono && typeof filters.telefono === 'string' && filters.telefono.trim()) {
                    query += ' AND telefono LIKE ?';
                    countQuery += ' AND telefono LIKE ?';
                    params.push(`%${filters.telefono.trim()}%`);
                }
                if (filters.correo_electronico && typeof filters.correo_electronico === 'string' && filters.correo_electronico.trim()) {
                    query += ' AND correo_electronico LIKE ?';
                    countQuery += ' AND correo_electronico LIKE ?';
                    params.push(`%${filters.correo_electronico.trim()}%`);
                }
            }

            // SOLUCIÓN: Usar concatenación de strings para LIMIT y OFFSET
            query += ` ORDER BY id_cliente DESC LIMIT ${limitNum} OFFSET ${offset}`;

            // Log para debug
            logger.info(`Ejecutando consulta: ${query}`);
            logger.info(`Parámetros consulta: ${JSON.stringify(params)}`);
            logger.info(`Consulta count: ${countQuery}`);
            logger.info(`Parámetros count: ${JSON.stringify(params)}`);

            // Ejecutar consulta principal (solo con parámetros de filtros)
            const [rows] = await pool.execute(query, params);
            
            // Ejecutar consulta de conteo
            const [countRows] = await pool.execute(countQuery, params);
            
            const total = countRows[0].count;

            return {
                clientes: rows,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            };
        } catch (error) {
            logger.error(`Error al obtener clientes: ${error.message}`);
            logger.error(`Filters recibidos: ${JSON.stringify(filters)}`);
            throw error;
        }
    }

    // Obtener cliente por ID
    static async getById(id_cliente) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM clientes WHERE id_cliente = ? AND activo = TRUE`,
                [id_cliente]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`Error al obtener cliente por ID: ${error.message}`);
            throw error;
        }
    }

    // Actualizar cliente
    static async update(id_cliente, clienteData) {
        try {
            const [result] = await pool.execute(
                `UPDATE clientes SET nombre_completo = ?, domicilio_hotel = ?, ciudad = ?, telefono = ?, licencia_conducir = ?, correo_electronico = ?
                 WHERE id_cliente = ? AND activo = TRUE`,
                [
                    clienteData.nombre_completo,
                    clienteData.domicilio_hotel,
                    clienteData.ciudad,
                    clienteData.telefono,
                    clienteData.licencia_conducir,
                    clienteData.correo_electronico,
                    id_cliente
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar cliente: ${error.message}`);
            throw error;
        }
    }

    // Eliminar cliente (borrado lógico)
    static async delete(id_cliente) {
        try {
            const [result] = await pool.execute(
                `UPDATE clientes SET activo = FALSE WHERE id_cliente = ? AND activo = TRUE`,
                [id_cliente]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al eliminar cliente: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Cliente;