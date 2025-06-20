// src/models/vehiculo.model.js
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const fs = require('fs').promises;



class Vehiculo {
    // Crear un nuevo vehículo
    static async create(vehiculoData) {
        try {
            const [result] = await pool.query('INSERT INTO vehiculos SET ?', vehiculoData);
            return result.insertId;
        } catch (error) {
            logger.error(`Error al crear vehículo: ${error.message}`);
            throw error;
        }
    }

    // Obtener todos los vehículos con paginación y filtros
    // src/models/Vehiculo.model.js - Versión final corregida
    static async getAll({ page = 1, limit = 10, filters = {} }) {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const offset = (pageNum - 1) * limitNum;

            let baseQuery = `SELECT * FROM vehiculos`;
            let countQuery = `SELECT COUNT(*) as total FROM vehiculos`;

            const whereClauses = [];
            const filterParams = [];

            // Aplicar filtros de forma segura con prepared statements
            if (filters.marca) {
                whereClauses.push('marca = ?');
                filterParams.push(filters.marca);
            }
            if (filters.modelo) {
                whereClauses.push('modelo = ?');
                filterParams.push(filters.modelo);
            }
            if (filters.estatus) {
                whereClauses.push('id_estatus = ?');
                filterParams.push(filters.estatus);
            }
            if (filters.search) {
                whereClauses.push(`(
                num_economico LIKE ? OR 
                placas LIKE ? OR 
                motor LIKE ? OR 
                numero_serie LIKE ?
            )`);
                const searchParam = `%${filters.search}%`;
                filterParams.push(searchParam, searchParam, searchParam, searchParam);
            }

            // Construir WHERE clause
            const whereClause = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

            // ✅ SOLUCIÓN: Usar query() para LIMIT/OFFSET y execute() para filtros
            let mainQuery;
            let vehiculos;

            if (filterParams.length > 0) {
                // Si hay filtros, usar prepared statement para la parte WHERE
                const queryWithoutLimit = baseQuery + whereClause + ' ORDER BY id DESC';
                mainQuery = queryWithoutLimit + ` LIMIT ${limitNum} OFFSET ${offset}`;
                [vehiculos] = await pool.query(mainQuery, filterParams);
            } else {
                // Si no hay filtros, usar query directo
                mainQuery = baseQuery + ` ORDER BY id DESC LIMIT ${limitNum} OFFSET ${offset}`;
                [vehiculos] = await pool.query(mainQuery);
            }

            console.log('Consulta ejecutada:', mainQuery);
            console.log('Parámetros:', filterParams);
            console.log('Vehículos encontrados:', vehiculos.length);

            // Contar total con prepared statement para filtros
            let total;
            if (filterParams.length > 0) {
                const finalCountQuery = countQuery + whereClause;
                const [totalResult] = await pool.execute(finalCountQuery, filterParams);
                total = totalResult[0].total;
            } else {
                const [totalResult] = await pool.query(countQuery);
                total = totalResult[0].total;
            }

            return {
                vehiculos,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            };
        } catch (error) {
            logger.error(`Error al obtener vehículos: ${error.message}`);
            throw error;
        }
    }

    // Obtener un vehículo por ID
    static async getById(id) {
        try {
            const [vehiculos] = await pool.execute('SELECT * FROM vehiculos WHERE id = ?', [id]);
            if (vehiculos.length === 0) return null;
            return vehiculos[0];
        } catch (error) {
            logger.error(`Error al obtener vehículo por ID: ${error.message}`);
            throw error;
        }
    }

    // Actualizar vehículo
    static async update(id, vehiculoData) {
        try {
            const [result] = await pool.query('UPDATE vehiculos SET ? WHERE id = ?', [vehiculoData, id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar vehículo: ${error.message}`);
            throw error;
        }
    }

    // Eliminar vehículo
    static async delete(id) {
        try {
            const [result] = await pool.execute('DELETE FROM vehiculos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al eliminar vehículo: ${error.message}`);
            throw error;
        }
    }

    // Verificar si número económico existe
    static async checkNumEconomicoExists(numEconomico, excludeId = null) {
        try {
            let query = 'SELECT id FROM vehiculos WHERE num_economico = ?';
            const params = [numEconomico];
            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }
            const [result] = await pool.execute(query, params);
            return result.length > 0;
        } catch (error) {
            logger.error(`Error al verificar número económico: ${error.message}`);
            throw error;
        }
    }

    // Obtener estadísticas de vehículos
    static async getStats() {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN id_estatus = 1 THEN 1 ELSE 0 END) as disponibles,
                    SUM(CASE WHEN id_estatus = 2 THEN 1 ELSE 0 END) as en_renta,
                    SUM(CASE WHEN id_estatus = 3 THEN 1 ELSE 0 END) as en_mantenimiento,
                    SUM(CASE WHEN id_estatus = 4 THEN 1 ELSE 0 END) as inactivo
                FROM vehiculos
            `);
            return stats[0];
        } catch (error) {
            logger.error(`Error al obtener estadísticas: ${error.message}`);
            throw error;
        }
    }

    // Obtener vista de flota
    static async getFlota() {
        try {
            const [flota] = await pool.execute(`
                SELECT 
                    ev.id,
                    ev.estatus,
                    COUNT(v.id) as cantidad,
                    GROUP_CONCAT(v.id) as ids_vehiculos
                FROM estatus_vehiculo ev
                LEFT JOIN vehiculos v ON ev.id = v.id_estatus
                GROUP BY ev.id, ev.estatus
                ORDER BY ev.id
            `);
            return flota;
        } catch (error) {
            logger.error(`Error al obtener flota: ${error.message}`);
            throw error;
        }
    }

}

module.exports = Vehiculo;


