// src/models/Contrato.model.js
const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Contrato {
    // Crear un nuevo contrato
    static async create(contratoData) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO contratos 
                (num_contrato, dias_renta, lugar_expedicion, fecha_salida, fecha_entrada, id_cliente, id_vehiculo, id_usuario, id_agencia, subtotal, iva, total, id_tipo_cambio, km_salida, gasolina_salida)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    contratoData.num_contrato,
                    contratoData.dias_renta,
                    contratoData.lugar_expedicion,
                    contratoData.fecha_salida,
                    contratoData.fecha_entrada,
                    contratoData.id_cliente,
                    contratoData.id_vehiculo,
                    contratoData.id_usuario,
                    contratoData.id_agencia,
                    contratoData.subtotal,
                    contratoData.iva,
                    contratoData.total,
                    contratoData.id_tipo_cambio,
                    contratoData.km_salida,
                    contratoData.gasolina_salida
                ]
            );
            return result.insertId;
        } catch (error) {
            logger.error(`Error al crear contrato: ${error.message}`);
            throw error;
        }
    }

    // Obtener todos los contratos con paginación y filtros
    static async getAll({ page = 1, limit = 10, filters = {} }) {
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT c.*, cl.nombre_completo AS cliente_nombre, v.marca, v.modelo, v.placas, u.nombre_completo AS usuario_nombre
                FROM contratos c
                LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
                LEFT JOIN vehiculos v ON c.id_vehiculo = v.id
                LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            `;
            const params = [];

            if (filters.numero_contrato) {
                query += ' WHERE c.num_contrato LIKE ?';
                params.push(`%${filters.numero_contrato}%`);
            }

            if (filters.fecha_inicio && filters.fecha_fin) {
                query += ' WHERE c.fecha_expedicion BETWEEN ? AND ?';
                params.push(filters.fecha_inicio, filters.fecha_fin);
            }

            if (filters.cliente) {
                query += ' WHERE cl.nombre_completo LIKE ?';
                params.push(`%${filters.cliente}%`);
            }

            if (filters.estado) {
                query += ' WHERE c.estado = ?';
                params.push(filters.estado);
            }

            // Añadir ORDER BY, LIMIT y OFFSET
            query += ' ORDER BY c.fecha_creacion DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            logger.error(`Error al obtener contratos: ${error.message}`);
            throw error;
        }
    }

    // Obtener contrato por ID
    static async getById(id_contrato) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM contratos WHERE id_contrato = ?`,
                [id_contrato]
            );
            return rows[0] || null;
        } catch (error) {
            logger.error(`Error al obtener contrato: ${error.message}`);
            throw error;
        }
    }

    // Actualizar contrato
    static async update(id_contrato, contratoData) {
        try {
            let query = `UPDATE contratos SET `;
            const updates = [];
            const values = [];

            if (contratoData.num_contrato !== undefined) {
                updates.push('num_contrato = ?');
                values.push(contratoData.num_contrato);
            }
            if (contratoData.dias !== undefined) {
                updates.push('dias = ?');
                values.push(contratoData.dias);
            }
            if (contratoData.lugar_expedicion !== undefined) {
                updates.push('lugar_expedicion = ?');
                values.push(contratoData.lugar_expedicion);
            }
            if (contratoData.fecha_expedicion !== undefined) {
                updates.push('fecha_expedicion = ?');
                values.push(contratoData.fecha_expedicion);
            }
            if (contratoData.fecha_vencimiento !== undefined) {
                updates.push('fecha_vencimiento = ?');
                values.push(contratoData.fecha_vencimiento);
            }
            if (contratoData.monto_total !== undefined) {
                updates.push('monto_total = ?');
                values.push(contratoData.monto_total);
            }
            if (contratoData.monto_anticipo !== undefined) {
                updates.push('monto_anticipo = ?');
                values.push(contratoData.monto_anticipo);
            }
            if (contratoData.id_tipo_contrato !== undefined) {
                updates.push('id_tipo_contrato = ?');
                values.push(contratoData.id_tipo_contrato);
            }
            if (contratoData.id_cliente !== undefined) {
                updates.push('id_cliente = ?');
                values.push(contratoData.id_cliente);
            }
            if (contratoData.id_vehiculo !== undefined) {
                updates.push('id_vehiculo = ?');
                values.push(contratoData.id_vehiculo);
            }
            if (contratoData.id_usuario !== undefined) {
                updates.push('id_usuario = ?');
                values.push(contratoData.id_usuario);
            }

            query += updates.join(', ');
            query += ` WHERE id_contrato = ?`;
            values.push(id_contrato);

            const [result] = await pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar contrato: ${error.message}`);
            throw error;
        }
    }

    // Eliminar contrato (soft delete)
    static async delete(id_contrato) {
        try {
            const [result] = await pool.execute(
                `DELETE FROM contratos WHERE id_contrato = ?`,
                [id_contrato]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al eliminar contrato: ${error.message}`);
            throw error;
        }
    }

    // Cambiar estado del contrato
    static async updateStatus(id_contrato, estado) {
        try {
            const [result] = await pool.execute(
                `UPDATE contratos SET estado = ? WHERE id_contrato = ?`,
                [estado, id_contrato]
            );
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al cambiar estado del contrato: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Contrato;