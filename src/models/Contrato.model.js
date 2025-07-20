// src/models/Contrato.model.js
const { pool } = require("../config/database")
const logger = require("../utils/logger")

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
                    contratoData.gasolina_salida,
                ],
            )
            return result.insertId
        } catch (error) {
            logger.error(`Error al crear contrato: ${error.message}`)
            throw error
        }
    }

    // Obtener todos los contratos con paginación y filtros
    static async getAll({ page = 1, limit = 10, filters = {} }) {
        try {
            const parsedPage = Number(page)
            const parsedLimit = Number(limit)
            const offset = (parsedPage - 1) * parsedLimit

            let whereClause = ""
            const params = []
            const conditions = []

            if (filters.numero_contrato) {
                conditions.push("c.num_contrato LIKE ?")
                params.push(`%${filters.numero_contrato}%`)
            }

            if (filters.cliente) {
                conditions.push("cl.nombre_completo LIKE ?")
                params.push(`%${filters.cliente}%`)
            }

            if (filters.estado) {
                conditions.push("c.estado = ?")
                params.push(filters.estado)
            }

            if (conditions.length > 0) {
                whereClause = " WHERE " + conditions.join(" AND ")
            }

            // Consulta principal para obtener los contratos de la página actual
            const query = `
                SELECT c.*, cl.nombre_completo AS cliente_nombre, v.marca, v.modelo, v.placas, u.nombre_completo AS usuario_nombre
                FROM contratos c
                LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
                LEFT JOIN vehiculos v ON c.id_vehiculo = v.id
                LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
                ${whereClause}
                ORDER BY c.fecha_creacion DESC
                LIMIT ? OFFSET ?
            `
            const mainQueryParams = [...params, parsedLimit, offset]

            // Consulta para obtener el total de contratos (sin paginación)
            const countQuery = `
                SELECT COUNT(*) as total
                FROM contratos c
                LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
                LEFT JOIN vehiculos v ON c.id_vehiculo = v.id
                LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
                ${whereClause}
            `
            const countQueryParams = [...params]

            // Ejecutar ambas consultas
            const [contracts] = await pool.query(query, mainQueryParams)
            const [countResult] = await pool.query(countQuery, countQueryParams)
            const total = countResult[0].total

            return {
                data: contracts,
                total: total,
                page: parsedPage,
                limit: parsedLimit,
            }
        } catch (error) {
            logger.error(`Error al obtener contratos: ${error.message}`)
            throw error
        }
    }

    // Obtener contrato por ID
    static async getById(id_contrato) {
        try {
            const [rows] = await pool.execute(`SELECT * FROM contratos WHERE id_contrato = ?`, [id_contrato])
            return rows[0] || null
        } catch (error) {
            logger.error(`Error al obtener contrato: ${error.message}`)
            throw error
        }
    }

    // Actualizar contrato 
    //Esto esta en el model
static async update(id_contrato, contratoData) {
    try {
        // Validar que el ID del contrato sea válido
        if (!id_contrato || isNaN(id_contrato)) {
            throw new Error('ID de contrato inválido')
        }

        // Verificar que se proporcionen datos para actualizar
        if (!contratoData || Object.keys(contratoData).length === 0) {
            throw new Error('No se proporcionaron datos para actualizar')
        }

        let query = `UPDATE contratos SET `
        const updates = []
        const values = []

        // Campos que coinciden con la función create (corregidos)
        if (contratoData.num_contrato !== undefined) {
            updates.push("num_contrato = ?")
            values.push(contratoData.num_contrato)
        }
        if (contratoData.dias_renta !== undefined) { // Era 'dias', ahora 'dias_renta'
            updates.push("dias_renta = ?")
            values.push(contratoData.dias_renta)
        }
        if (contratoData.lugar_expedicion !== undefined) {
            updates.push("lugar_expedicion = ?")
            values.push(contratoData.lugar_expedicion)
        }
        if (contratoData.fecha_salida !== undefined) { // Era 'fecha_expedicion'
            updates.push("fecha_salida = ?")
            values.push(contratoData.fecha_salida)
        }
        if (contratoData.fecha_entrada !== undefined) { // Era 'fecha_vencimiento'
            updates.push("fecha_entrada = ?")
            values.push(contratoData.fecha_entrada)
        }
        if (contratoData.id_cliente !== undefined) {
            updates.push("id_cliente = ?")
            values.push(contratoData.id_cliente)
        }
        if (contratoData.id_vehiculo !== undefined) {
            updates.push("id_vehiculo = ?")
            values.push(contratoData.id_vehiculo)
        }
        if (contratoData.id_usuario !== undefined) {
            updates.push("id_usuario = ?")
            values.push(contratoData.id_usuario)
        }
        
        // Campos adicionales que están en create pero faltaban en update
        if (contratoData.id_agencia !== undefined) {
            updates.push("id_agencia = ?")
            values.push(contratoData.id_agencia)
        }
        if (contratoData.subtotal !== undefined) {
            updates.push("subtotal = ?")
            values.push(contratoData.subtotal)
        }
        if (contratoData.iva !== undefined) {
            updates.push("iva = ?")
            values.push(contratoData.iva)
        }
        if (contratoData.total !== undefined) {
            updates.push("total = ?")
            values.push(contratoData.total)
        }
        if (contratoData.id_tipo_cambio !== undefined) {
            updates.push("id_tipo_cambio = ?")
            values.push(contratoData.id_tipo_cambio)
        }
        if (contratoData.km_salida !== undefined) {
            updates.push("km_salida = ?")
            values.push(contratoData.km_salida)
        }
        if (contratoData.gasolina_salida !== undefined) {
            updates.push("gasolina_salida = ?")
            values.push(contratoData.gasolina_salida)
        }
        
        // Campos adicionales que podrían necesitar actualización
        if (contratoData.km_entrada !== undefined) {
            updates.push("km_entrada = ?")
            values.push(contratoData.km_entrada)
        }
        if (contratoData.gasolina_entrada !== undefined) {
            updates.push("gasolina_entrada = ?")
            values.push(contratoData.gasolina_entrada)
        }
        if (contratoData.estado !== undefined) {
            updates.push("estado = ?")
            values.push(contratoData.estado)
        }

        // Verificar que hay campos para actualizar
        if (updates.length === 0) {
            throw new Error('No hay campos válidos para actualizar')
        }

        query += updates.join(", ")
        query += ` WHERE id_contrato = ?`
        values.push(id_contrato)

        const [result] = await pool.execute(query, values)
        
        // Verificar si se actualizó algún registro
        if (result.affectedRows === 0) {
            throw new Error('No se encontró el contrato o no se realizaron cambios')
        }

        return {
            success: true,
            affectedRows: result.affectedRows,
            message: 'Contrato actualizado exitosamente'
        }
        
    } catch (error) {
        logger.error(`Error al actualizar contrato ${id_contrato}: ${error.message}`)
        throw error
    }
}

    // Eliminar contrato (soft delete)
    static async delete(id_contrato) {
        try {
            const [result] = await pool.execute(`DELETE FROM contratos WHERE id_contrato = ?`, [id_contrato])
            return result.affectedRows > 0
        } catch (error) {
            logger.error(`Error al eliminar contrato: ${error.message}`)
            throw error
        }
    }

    // Cambiar estado del contrato
    static async updateStatus(id_contrato, estado) {
        try {
            const [result] = await pool.execute(`UPDATE contratos SET estado = ? WHERE id_contrato = ?`, [
                estado,
                id_contrato,
            ])
            return result.affectedRows > 0
        } catch (error) {
            logger.error(`Error al cambiar estado del contrato: ${error.message}`)
            throw error
        }
    }
    static async obtenerVistaCompleta(filtros = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                estado = null,
                clienteNombre = null,
                orderBy = "fecha_salida",
                orderDir = "DESC",
            } = filtros

            const offset = Number(page - 1) * Number(limit)

            let whereClause = ""
            const params = []

            // Construir filtros
            const condiciones = []

            if (estado) {
                condiciones.push("estado_actual = ?")
                params.push(estado)
            }

            if (clienteNombre) {
                condiciones.push("cliente_nombre LIKE ?")
                params.push(`%${clienteNombre}%`)
            }

            if (condiciones.length > 0) {
                whereClause = "WHERE " + condiciones.join(" AND ")
            }

            // Validar orderBy y orderDir para evitar SQL injection y errores
            const allowedOrderBy = [
                "id_contrato",
                "num_contrato",
                "fecha_salida",
                "fecha_entrada",
                "dias_renta",
                "total",
                "codigo_moneda",
                "estado",
                "estado_actual",
                "dias_restantes",
                "cliente_nombre",
                "cliente_telefono",
                "cliente_domicilio",
                "cliente_ciudad",
                "cliente_licencia",
                "num_economico",
                "marca",
                "modelo",
                "color",
                "placas",
                "anio",
                "tipo_vehiculo",
                "empleado_nombre",
            ]
            const allowedOrderDir = ["ASC", "DESC"]
            const safeOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : "fecha_salida"
            const safeOrderDir = allowedOrderDir.includes(orderDir.toUpperCase()) ? orderDir.toUpperCase() : "DESC"

            // Consulta principal usando la vista (LIMIT y OFFSET interpolados)
            const query = `
        SELECT 
          id_contrato,
          num_contrato,
          fecha_salida,
          fecha_entrada,
          dias_renta,
          total,
          codigo_moneda,
          estado,
          estado_actual,
          dias_restantes,
          cliente_nombre,
          cliente_telefono,
          cliente_domicilio,
          cliente_ciudad,
          cliente_licencia,
          num_economico,
          marca,
          modelo,
          color,
          placas,
          anio,
          tipo_vehiculo,
          empleado_nombre
        FROM vista_contrato_completo 
        ${whereClause}
        ORDER BY ${safeOrderBy} ${safeOrderDir}
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `

            // Consulta para contar total
            const countQuery = `
        SELECT COUNT(*) as total FROM vista_contrato_completo 
        ${whereClause}
      `

            // Parámetros para la consulta principal (solo filtros)
            const mainParams = [...params]
            // Parámetros para la consulta de conteo (solo filtros)
            const countParams = [...params]

            // LOGS DE DEPURACIÓN
            logger.info("Query principal:", query)
            logger.info("Parámetros principal:", mainParams)
            logger.info("Query conteo:", countQuery)
            logger.info("Parámetros conteo:", countParams)

            const [contratos] = await pool.execute(query, mainParams)
            const [countResult] = await pool.execute(countQuery, countParams)

            return {
                success: true,
                data: contratos,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(countResult[0].total / Number(limit)),
                    totalItems: countResult[0].total,
                    itemsPerPage: Number(limit),
                },
            }
        } catch (error) {
            logger.error("Error en obtenerVistaCompleta:", error)
            throw new Error(`Error al obtener vista completa: ${error.message}`)
        }
    }

    // NUEVO: Obtener resumen de contratos por estado
    static async obtenerResumenEstados() {
        try {
            const query = `
        SELECT 
          estado_actual,
          COUNT(*) as cantidad,
          SUM(total) as total_ingresos
        FROM vista_contrato_completo 
        GROUP BY estado_actual
        ORDER BY cantidad DESC
      `

            const [rows] = await pool.execute(query)
            return { success: true, data: rows }
        } catch (error) {
            throw new Error(`Error al obtener resumen de estados: ${error.message}`)
        }
    }

    // NUEVO: Obtener contratos próximos a vencer (3 días)
    static async obtenerProximosVencer() {
        try {
            const query = `
        SELECT * FROM vista_contrato_completo 
        WHERE estado_actual = 'ACTIVO' 
        AND dias_restantes <= 3 
        AND dias_restantes >= 0
        ORDER BY dias_restantes ASC
      `

            const [rows] = await pool.execute(query)
            return { success: true, data: rows }
        } catch (error) {
            throw new Error(`Error al obtener contratos próximos a vencer: ${error.message}`)
        }
    }
}

module.exports = Contrato
