// src/models/Clientes.model.js
const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Cliente {
    // Crear un nuevo cliente
    static async create(clienteData) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO clientes 
                (nombre_completo, domicilio_hotel, ciudad, telefono, licencia_conducir, correo_electronico)
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

    // Buscar clientes por nombre o teléfono
    static async search(nombre, telefono) {
        try {
            let query = `
                SELECT * FROM clientes
                WHERE activo = TRUE
            `;
            const params = [];

            if (nombre) {
                query += ' AND nombre_completo LIKE ?';
                params.push(`%${nombre}%`);
            }

            if (telefono) {
                query += ' AND telefono LIKE ?';
                params.push(`%${telefono}%`);
            }

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            logger.error(`Error al buscar clientes: ${error.message}`);
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
            logger.error(`Error al obtener cliente: ${error.message}`);
            throw error;
        }
    }

    // Actualizar cliente
    static async update(id_cliente, clienteData) {
        try {
            let query = `UPDATE clientes SET `;
            const updates = [];
            const values = [];

            if (clienteData.nombre_completo !== undefined) {
                updates.push('nombre_completo = ?');
                values.push(clienteData.nombre_completo);
            }
            if (clienteData.domicilio_hotel !== undefined) {
                updates.push('domicilio_hotel = ?');
                values.push(clienteData.domicilio_hotel);
            }
            if (clienteData.ciudad !== undefined) {
                updates.push('ciudad = ?');
                values.push(clienteData.ciudad);
            }
            if (clienteData.telefono !== undefined) {
                updates.push('telefono = ?');
                values.push(clienteData.telefono);
            }
            if (clienteData.licencia_conducir !== undefined) {
                updates.push('licencia_conducir = ?');
                values.push(clienteData.licencia_conducir);
            }
            if (clienteData.correo_electronico !== undefined) {
                updates.push('correo_electronico = ?');
                values.push(clienteData.correo_electronico);
            }

            query += updates.join(', ');
            query += ` WHERE id_cliente = ?`;
            values.push(id_cliente);

            const [result] = await pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            logger.error(`Error al actualizar cliente: ${error.message}`);
            throw error;
        }
    }

    // Eliminar cliente (soft delete)
    static async delete(id_cliente) {
        try {
            const [result] = await pool.execute(
                `UPDATE clientes SET activo = FALSE WHERE id_cliente = ?`,
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