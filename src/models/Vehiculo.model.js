// src/models/Vehiculo.js
const db = require('../config/database');
const logger = require('../utils/logger');

class Vehiculo {
    // Crear un nuevo vehículo
    static async create(vehiculoData) {
        try {
            const [result] = await db.query('INSERT INTO vehiculos SET ?', vehiculoData);
            return result.insertId;
        } catch (error) {
            logger.error(`Error al crear vehículo: ${error.message}`);
            throw error;
        }
    }

    // Obtener todos los vehículos con paginación y filtros
    static async getAll({ page = 1, limit = 10, filters = {} }) {
        try {
            const offset = (page - 1) * limit;
            let query = `
        SELECT v.*, 
          m.nombre AS marca_nombre, 
          mo.nombre AS modelo_nombre,
          c.nombre AS color_nombre,
          ta.tipo AS tipo_auto,
          t.tipo AS transmision,
          ev.estatus AS estatus_vehiculo
        FROM vehiculos v
        LEFT JOIN marcas m ON v.id_marca = m.id
        LEFT JOIN modelos mo ON v.id_modelo = mo.id
        LEFT JOIN colores c ON v.id_color = c.id
        LEFT JOIN tipos_auto ta ON v.id_tipo_auto = ta.id
        LEFT JOIN transmisiones t ON v.id_transmision = t.id
        LEFT JOIN estatus_vehiculo ev ON v.id_estatus = ev.id
      `;

            const whereClauses = [];
            const queryParams = [];

            // Aplicar filtros
            if (filters.marca) {
                whereClauses.push('v.id_marca = ?');
                queryParams.push(filters.marca);
            }
            if (filters.modelo) {
                whereClauses.push('v.id_modelo = ?');
                queryParams.push(filters.modelo);
            }
            if (filters.estatus) {
                whereClauses.push('v.id_estatus = ?');
                queryParams.push(filters.estatus);
            }
            if (filters.search) {
                whereClauses.push(`
            (v.num_economico LIKE ? OR 
            v.placas LIKE ? OR 
            v.motor LIKE ? OR 
            v.numero_serie LIKE ?)
        `);
                const searchParam = `%${filters.search}%`;
                queryParams.push(searchParam, searchParam, searchParam, searchParam);
            }

            if (whereClauses.length > 0) {
                query += ' WHERE ' + whereClauses.join(' AND ');
            }

            query += ' LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);

            const [vehiculos] = await db.query(query, queryParams);

            // Obtener total para paginación
            let countQuery = 'SELECT COUNT(*) as total FROM vehiculos v';
            if (whereClauses.length > 0) {
                countQuery += ' WHERE ' + whereClauses.join(' AND ');
            }
            const [totalResult] = await db.query(countQuery, queryParams.slice(0, -2));
            const total = totalResult[0].total;

            return {
                vehiculos,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error(`Error al obtener vehículos: ${error.message}`);
            throw error;
        }
    }

    // Obtener un vehículo por ID con todos sus detalles
    static async getById(id) {
        try {
            const [vehiculos] = await db.query(`
        SELECT v.*, 
            m.nombre AS marca_nombre, 
            mo.nombre AS modelo_nombre,
            c.nombre AS color_nombre,
            ta.tipo AS tipo_auto,
            t.tipo AS transmision,
            ev.estatus AS estatus_vehiculo
        FROM vehiculos v
        LEFT JOIN marcas m ON v.id_marca = m.id
        LEFT JOIN modelos mo ON v.id_modelo = mo.id
        LEFT JOIN colores c ON v.id_color = c.id
        LEFT JOIN tipos_auto ta ON v.id_tipo_auto = ta.id
        LEFT JOIN transmisiones t ON v.id_transmision = t.id
        LEFT JOIN estatus_vehiculo ev ON v.id_estatus = ev.id
        WHERE v.id = ?
        `, [id]);

            if (vehiculos.length === 0) {
                return null;
            }

            const vehiculo = vehiculos[0];

            // Obtener características del vehículo
            const [caracteristicas] = await db.query(`
        SELECT c.* FROM vehiculo_caracteristicas vc
        JOIN caracteristicas c ON vc.caracteristica_id = c.id
        WHERE vc.vehiculo_id = ?
    `, [id]);
            vehiculo.caracteristicas = caracteristicas;

            // Obtener póliza de seguro
            const [polizas] = await db.query(`
        SELECT ps.*, a.nombre AS aseguradora_nombre 
        FROM polizas_seguro ps
        LEFT JOIN aseguradoras a ON ps.id_aseguradora = a.id
        WHERE ps.id_vehiculo = ?
        ORDER BY ps.fecha_vencimiento DESC
        LIMIT 1
    `, [id]);
            vehiculo.poliza_seguro = polizas.length > 0 ? polizas[0] : null;

            // Obtener documentos
            const [documentos] = await db.query(`
        SELECT * FROM documentos_vehiculo
        WHERE id_vehiculo = ?
    `, [id]);
            vehiculo.documentos = documentos;

            return vehiculo;
        } catch (error) {
            logger.error(`Error al obtener vehículo por ID: ${error.message}`);
            throw error;
        }
    }

    // Actualizar vehículo
    static async update(id, vehiculoData) {
        try {
            const [result] = await db.query('UPDATE vehiculos SET ? WHERE id = ?', [vehiculoData, id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar vehículo: ${error.message}`);
            throw error;
        }
    }

    // Eliminar vehículo
    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM vehiculos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al eliminar vehículo: ${error.message}`);
            throw error;
        }
    }

    // Obtener estadísticas de vehículos
    static async getStats() {
        try {
            const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN id_estatus = 1 THEN 1 ELSE 0 END) as disponibles,
            SUM(CASE WHEN id_estatus = 2 THEN 1 ELSE 0 END) as en_mantenimiento,
            SUM(CASE WHEN id_estatus = 3 THEN 1 ELSE 0 END) as ocupados,
            SUM(CASE WHEN id_estatus = 4 THEN 1 ELSE 0 END) as en_taller
        FROM vehiculos
    `);

            return stats[0];
        } catch (error) {
            logger.error(`Error al obtener estadísticas de vehículos: ${error.message}`);
            throw error;
        }
    }

    // Obtener vista de flota
    static async getFlota() {
        try {
            const [flota] = await db.query(`
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
            logger.error(`Error al obtener vista de flota: ${error.message}`);
            throw error;
        }
    }

    // Obtener catálogos
    static async getCatalogs() {
        try {
            const [marcas] = await db.query('SELECT * FROM marcas');
            const [modelos] = await db.query('SELECT * FROM modelos');
            const [colores] = await db.query('SELECT * FROM colores');
            const [tiposAuto] = await db.query('SELECT * FROM tipos_auto');
            const [transmisiones] = await db.query('SELECT * FROM transmisiones');
            const [estatus] = await db.query('SELECT * FROM estatus_vehiculo');
            const [caracteristicas] = await db.query('SELECT * FROM caracteristicas');

            return {
                marcas,
                modelos,
                colores,
                tiposAuto,
                transmisiones,
                estatus,
                caracteristicas
            };
        } catch (error) {
            logger.error(`Error al obtener catálogos: ${error.message}`);
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

            const [result] = await db.query(query, params);
            return result.length > 0;
        } catch (error) {
            logger.error(`Error al verificar número económico: ${error.message}`);
            throw error;
        }
    }

    // Actualizar características del vehículo
    static async updateCaracteristicas(vehiculoId, caracteristicasIds) {
        try {
            await db.query('DELETE FROM vehiculo_caracteristicas WHERE vehiculo_id = ?', [vehiculoId]);

            if (caracteristicasIds && caracteristicasIds.length > 0) {
                const values = caracteristicasIds.map(id => [vehiculoId, id]);
                await db.query('INSERT INTO vehiculo_caracteristicas (vehiculo_id, caracteristica_id) VALUES ?', [values]);
            }

            return true;
        } catch (error) {
            logger.error(`Error al actualizar características: ${error.message}`);
            throw error;
        }
    }

    // Agregar documento a vehículo
    static async addDocument(vehiculoId, tipoDocumento, archivo) {
        try {
            const [result] = await db.query(
                'INSERT INTO documentos_vehiculo (id_vehiculo, tipo_documento, archivo) VALUES (?, ?, ?)',
                [vehiculoId, tipoDocumento, archivo]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`Error al agregar documento: ${error.message}`);
            throw error;
        }
    }

    // Obtener vehículos con información de pólizas
    static async getWithPolizas() {
        try {
            const [vehiculos] = await db.query(`
        SELECT 
            v.id,
            v.num_economico,
            v.placas,
            m.nombre AS marca,
            mo.nombre AS modelo,
            ev.estatus,
            ps.numero_poliza,
            ps.fecha_vencimiento,
            a.nombre AS aseguradora,
            DATEDIFF(ps.fecha_vencimiento, CURDATE()) AS dias_restantes
        FROM vehiculos v
        LEFT JOIN marcas m ON v.id_marca = m.id
        LEFT JOIN modelos mo ON v.id_modelo = mo.id
        LEFT JOIN estatus_vehiculo ev ON v.id_estatus = ev.id
        LEFT JOIN (
            SELECT id_vehiculo, numero_poliza, fecha_vencimiento, id_aseguradora
            FROM polizas_seguro
            WHERE (id_vehiculo, fecha_vencimiento) IN (
            SELECT id_vehiculo, MAX(fecha_vencimiento)
            FROM polizas_seguro
            GROUP BY id_vehiculo
            )
        ) ps ON v.id = ps.id_vehiculo
        LEFT JOIN aseguradoras a ON ps.id_aseguradora = a.id
        ORDER BY ps.fecha_vencimiento ASC
    `);

            return vehiculos;
        } catch (error) {
            logger.error(`Error al obtener vehículos con pólizas: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Vehiculo;