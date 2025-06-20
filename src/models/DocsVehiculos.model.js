// src/models/DocsVehiculo.model.js
const { pool } = require('../config/database');
const logger = require('../utils/logger');
const fs = require('fs').promises;

class DocsVehiculo {
    // ========================================
    // FUNCIONES PARA DOCUMENTOS GENERALES
    // ========================================

    /**
     * Agregar documento general al vehículo (SIN fecha de vencimiento)
     * @param {number} vehiculoId - ID del vehículo
     * @param {string} tipoDocumento - Tipo de documento
     * @param {object} archivo - Información del archivo subido
     * @param {number} usuarioId - ID del usuario que sube el documento
     * @param {string} descripcion - Descripción opcional del documento
     */
    static async addDocument(vehiculoId, tipoDocumento, archivo, usuarioId, descripcion = null) {
        const connection = await pool.getConnection(); 
        try {
            await connection.beginTransaction();

            const query = `
                INSERT INTO documentos_vehiculo 
                (id_vehiculo, tipo_documento, nombre_archivo, ruta_archivo, descripcion, subido_por)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(query, [
                vehiculoId,
                tipoDocumento,
                archivo.filename,
                archivo.path,
                descripcion,
                usuarioId
            ]);

            await connection.commit();

            // Obtener el documento recién creado
            const documentoCreado = await this.getDocumentById(result.insertId);

            logger.info(`Documento ${tipoDocumento} agregado al vehículo ${vehiculoId}`);
            return documentoCreado;

        } catch (error) {
            await connection.rollback();
            // Eliminar archivo si falla la BD
            try {
                await fs.unlink(archivo.path);
            } catch (unlinkError) {
                logger.error(`Error al eliminar archivo: ${unlinkError.message}`);
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener todos los documentos de un vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    static async getDocuments(vehiculoId) {
        try {
            const query = `
                SELECT 
                    dv.*,
                    u.nombre_completo
                FROM documentos_vehiculo dv
                LEFT JOIN usuarios u ON dv.subido_por = u.id_usuario
                WHERE dv.id_vehiculo = ?
                ORDER BY dv.fecha_subida DESC
            `;

            const [documents] = await pool.execute(query, [vehiculoId]);

            // Agregar información adicional a cada documento
            const documentsWithInfo = documents.map(doc => ({
                ...doc,
                subido_por_nombre: doc.nombre_completo ? `${doc.nombre_completo}` : 'Usuario desconocido',
                tamaño_archivo: null, // Se puede calcular si es necesario
                url_descarga: `/api/vehiculos/documents/${doc.id_documento}/download`
            }));

            return documentsWithInfo;

        } catch (error) {
            logger.error(`Error al obtener documentos del vehículo ${vehiculoId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener documento por ID
     * @param {number} documentoId - ID del documento
     */
    static async getDocumentById(documentoId) {
        try {
            const query = `
                SELECT 
                    dv.*,
                    u.nombre_completo
                FROM documentos_vehiculo dv
                LEFT JOIN usuarios u ON dv.subido_por = u.id_usuario
                WHERE dv.id_documento = ?
            `;

            const [documents] = await pool.execute(query, [documentoId]);

            if (documents.length === 0) {
                return null;
            }

            const documento = documents[0];
            return {
                ...documento,
                subido_por_nombre: documento.nombre_completo ?
                    `${documento.nombre_completo}` : 'Usuario desconocido',
                url_descarga: `/api/vehiculos/documents/${documento.id_documento}/download`
            };

        } catch (error) {
            logger.error(`Error al obtener documento ${documentoId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener documentos por tipo
     * @param {number} vehiculoId - ID del vehículo
     * @param {string} tipoDocumento - Tipo de documento
     */
    static async getDocumentsByType(vehiculoId, tipoDocumento) {
        try {
            const query = `
                SELECT 
                    dv.*,
                    u.nombre_completo
                FROM documentos_vehiculo dv
                LEFT JOIN usuarios u ON dv.subido_por = u.id_usuario
                WHERE dv.id_vehiculo = ? AND dv.tipo_documento = ?
                ORDER BY dv.fecha_subida DESC
            `;

            const [documents] = await pool.execute(query, [vehiculoId, tipoDocumento]);

            return documents.map(doc => ({
                ...doc,
                subido_por_nombre: doc.nombre_completo ?
                    `${doc.nombre_completo}` : 'Usuario desconocido',
                url_descarga: `/api/vehiculos/documents/${doc.id_documento}/download`
            }));

        } catch (error) {
            logger.error(`Error al obtener documentos del tipo ${tipoDocumento}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Actualizar documento existente
     * @param {number} documentoId - ID del documento
     * @param {object} nuevosDatos - Nuevos datos del documento
     */
    static async updateDocument(documentoId, nuevosDatos) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar que el documento existe
            const documentoExistente = await this.getDocumentById(documentoId);
            if (!documentoExistente) {
                throw new Error('Documento no encontrado');
            }

            let query = 'UPDATE documentos_vehiculo SET ';
            const params = [];
            const updates = [];

            // Construir query dinámicamente según los datos proporcionados
            if (nuevosDatos.tipo_documento) {
                updates.push('tipo_documento = ?');
                params.push(nuevosDatos.tipo_documento);
            }

            if (nuevosDatos.descripcion !== undefined) {
                updates.push('descripcion = ?');
                params.push(nuevosDatos.descripcion);
            }

            // Si hay un nuevo archivo, actualizar los datos del archivo
            if (nuevosDatos.archivo) {
                updates.push('nombre_archivo = ?', 'ruta_archivo = ?');
                params.push(nuevosDatos.archivo.filename, nuevosDatos.archivo.path);
            }

            if (updates.length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            query += updates.join(', ') + ' WHERE id_documento = ?';
            params.push(documentoId);

            await connection.execute(query, params);

            // Si hay nuevo archivo, eliminar el anterior
            if (nuevosDatos.archivo && documentoExistente.ruta_archivo) {
                try {
                    await fs.unlink(documentoExistente.ruta_archivo);
                } catch (unlinkError) {
                    logger.warn(`No se pudo eliminar el archivo anterior: ${unlinkError.message}`);
                }
            }

            await connection.commit();

            // Retornar documento actualizado
            const documentoActualizado = await this.getDocumentById(documentoId);
            logger.info(`Documento ${documentoId} actualizado correctamente`);
            return documentoActualizado;

        } catch (error) {
            await connection.rollback();
            // Si hay nuevo archivo y falla la actualización, eliminarlo
            if (nuevosDatos.archivo) {
                try {
                    await fs.unlink(nuevosDatos.archivo.path);
                } catch (unlinkError) {
                    logger.error(`Error al eliminar archivo tras fallo: ${unlinkError.message}`);
                }
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar documento del sistema y del servidor
     * @param {number} documentoId - ID del documento
     */
    static async deleteDocument(documentoId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Obtener información del documento antes de eliminarlo
            const documento = await this.getDocumentById(documentoId);
            if (!documento) {
                throw new Error('Documento no encontrado');
            }

            // Eliminar de la base de datos
            const deleteQuery = 'DELETE FROM documentos_vehiculo WHERE id_documento = ?';
            const [result] = await connection.execute(deleteQuery, [documentoId]);

            if (result.affectedRows === 0) {
                throw new Error('No se pudo eliminar el documento de la base de datos');
            }

            // Eliminar archivo del servidor
            if (documento.ruta_archivo) {
                try {
                    await fs.unlink(documento.ruta_archivo);
                } catch (unlinkError) {
                    logger.warn(`Archivo ya no existe en el servidor: ${unlinkError.message}`);
                }
            }

            await connection.commit();
            logger.info(`Documento ${documentoId} eliminado correctamente`);
            return documento;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // ========================================
    // FUNCIONES PARA PÓLIZAS DE SEGURO
    // ========================================

    /**
     * Crear nueva póliza de seguro (CON fecha de vencimiento)
     * @param {number} vehiculoId - ID del vehículo
     * @param {object} datosPoliza - Datos de la póliza
     * @param {object} archivo - Archivo de la póliza (opcional)
     */
    static async addPoliza(vehiculoId, datosPoliza, archivo = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Si se marca como activa, desactivar pólizas anteriores
            if (datosPoliza.activa) {
                const deactivateQuery = 'UPDATE polizas_seguro SET activa = FALSE WHERE id_vehiculo = ? AND activa = TRUE';
                await connection.execute(deactivateQuery, [vehiculoId]);
            }

            const query = `
                INSERT INTO polizas_seguro 
                (id_vehiculo, numero_poliza, aseguradora, tipo_cobertura, fecha_inicio, 
                 fecha_vencimiento, monto_cobertura, prima_anual, deducible, beneficiario, 
                 observaciones, nombre_archivo, ruta_archivo, activa)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.execute(query, [
                vehiculoId,
                datosPoliza.numero_poliza,
                datosPoliza.aseguradora,
                datosPoliza.tipo_cobertura || null,
                datosPoliza.fecha_inicio,
                datosPoliza.fecha_vencimiento,
                datosPoliza.monto_cobertura || null,
                datosPoliza.prima_anual || null,
                datosPoliza.deducible || null,
                datosPoliza.beneficiario || null,
                datosPoliza.observaciones || null,
                archivo ? archivo.filename : null,
                archivo ? archivo.path : null,
                datosPoliza.activa !== undefined ? datosPoliza.activa : true
            ]);

            await connection.commit();

            // Obtener la póliza recién creada
            const polizaCreada = await this.getPolizaById(result.insertId);
            logger.info(`Póliza ${datosPoliza.numero_poliza} creada para vehículo ${vehiculoId}`);
            return polizaCreada;

        } catch (error) {
            await connection.rollback();
            // Eliminar archivo si falla la BD
            if (archivo) {
                try {
                    await fs.unlink(archivo.path);
                } catch (unlinkError) {
                    logger.error(`Error al eliminar archivo: ${unlinkError.message}`);
                }
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener todas las pólizas de un vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    static async getPolizas(vehiculoId) {
        try {
            const query = `
                SELECT 
                    *,
                    DATEDIFF(fecha_vencimiento, CURDATE()) as dias_para_vencer,
                    CASE 
                        WHEN fecha_vencimiento < CURDATE() THEN 'vencida'
                        WHEN DATEDIFF(fecha_vencimiento, CURDATE()) <= 30 THEN 'por_vencer'
                        ELSE 'vigente'
                    END as estado
                FROM polizas_seguro
                WHERE id_vehiculo = ?
                ORDER BY activa DESC, fecha_creacion DESC
            `;

            const [polizas] = await pool.execute(query, [vehiculoId]);

            return polizas.map(poliza => ({
                ...poliza,
                url_descarga: poliza.nombre_archivo ? `/api/vehiculos/polizas/${poliza.id_poliza}/download` : null
            }));

        } catch (error) {
            logger.error(`Error al obtener pólizas del vehículo ${vehiculoId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener póliza por ID
     * @param {number} polizaId - ID de la póliza
     */
    static async getPolizaById(polizaId) {
        try {
            const query = `
                SELECT 
                    *,
                    DATEDIFF(fecha_vencimiento, CURDATE()) as dias_para_vencer,
                    CASE 
                        WHEN fecha_vencimiento < CURDATE() THEN 'vencida'
                        WHEN DATEDIFF(fecha_vencimiento, CURDATE()) <= 30 THEN 'por_vencer'
                        ELSE 'vigente'
                    END as estado
                FROM polizas_seguro
                WHERE id_poliza = ?
            `;

            const [polizas] = await pool.execute(query, [polizaId]);

            if (polizas.length === 0) {
                return null;
            }

            const poliza = polizas[0];
            return {
                ...poliza,
                url_descarga: poliza.nombre_archivo ? `/api/vehiculos/polizas/${poliza.id_poliza}/download` : null
            };

        } catch (error) {
            logger.error(`Error al obtener póliza ${polizaId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Actualizar póliza existente
     * @param {number} polizaId - ID de la póliza
     * @param {object} nuevosDatos - Nuevos datos de la póliza
     * @param {object} nuevoArchivo - Nuevo archivo (opcional)
     */
    static async updatePoliza(polizaId, nuevosDatos, nuevoArchivo = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar que la póliza existe
            const polizaExistente = await this.getPolizaById(polizaId);
            if (!polizaExistente) {
                throw new Error('Póliza no encontrada');
            }

            // Si se marca como activa, desactivar otras pólizas del mismo vehículo
            if (nuevosDatos.activa) {
                const deactivateQuery = 'UPDATE polizas_seguro SET activa = FALSE WHERE id_vehiculo = ? AND id_poliza != ? AND activa = TRUE';
                await connection.execute(deactivateQuery, [polizaExistente.id_vehiculo, polizaId]);
            }

            let query = 'UPDATE polizas_seguro SET ';
            const params = [];
            const updates = [];

            // Construir query dinámicamente
            const camposPermitidos = [
                'numero_poliza', 'aseguradora', 'tipo_cobertura', 'fecha_inicio',
                'fecha_vencimiento', 'monto_cobertura', 'prima_anual', 'deducible',
                'beneficiario', 'observaciones', 'activa'
            ];

            camposPermitidos.forEach(campo => {
                if (nuevosDatos[campo] !== undefined) {
                    updates.push(`${campo} = ?`);
                    params.push(nuevosDatos[campo]);
                }
            });

            // Si hay nuevo archivo
            if (nuevoArchivo) {
                updates.push('nombre_archivo = ?', 'ruta_archivo = ?');
                params.push(nuevoArchivo.filename, nuevoArchivo.path);
            }

            if (updates.length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            query += updates.join(', ') + ' WHERE id_poliza = ?';
            params.push(polizaId);

            await connection.execute(query, params);

            // Si hay nuevo archivo, eliminar el anterior
            if (nuevoArchivo && polizaExistente.ruta_archivo) {
                try {
                    await fs.unlink(polizaExistente.ruta_archivo);
                } catch (unlinkError) {
                    logger.warn(`No se pudo eliminar el archivo anterior: ${unlinkError.message}`);
                }
            }

            await connection.commit();

            // Retornar póliza actualizada
            const polizaActualizada = await this.getPolizaById(polizaId);
            logger.info(`Póliza ${polizaId} actualizada correctamente`);
            return polizaActualizada;

        } catch (error) {
            await connection.rollback();
            // Si hay nuevo archivo y falla la actualización, eliminarlo
            if (nuevoArchivo) {
                try {
                    await fs.unlink(nuevoArchivo.path);
                } catch (unlinkError) {
                    logger.error(`Error al eliminar archivo tras fallo: ${unlinkError.message}`);
                }
            }
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Eliminar póliza del sistema y del servidor
     * @param {number} polizaId - ID de la póliza
     */
    static async deletePoliza(polizaId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Obtener información de la póliza antes de eliminarla
            const poliza = await this.getPolizaById(polizaId);
            if (!poliza) {
                throw new Error('Póliza no encontrada');
            }

            // Eliminar de la base de datos
            const deleteQuery = 'DELETE FROM polizas_seguro WHERE id_poliza = ?';
            const [result] = await connection.execute(deleteQuery, [polizaId]);

            if (result.affectedRows === 0) {
                throw new Error('No se pudo eliminar la póliza de la base de datos');
            }

            // Eliminar archivo del servidor
            if (poliza.ruta_archivo) {
                try {
                    await fs.unlink(poliza.ruta_archivo);
                } catch (unlinkError) {
                    logger.warn(`Archivo ya no existe en el servidor: ${unlinkError.message}`);
                }
            }

            await connection.commit();
            logger.info(`Póliza ${polizaId} eliminada correctamente`);
            return poliza;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener pólizas próximas a vencer (para alertas)
     * @param {number} dias - Días de anticipación para la alerta (default: 30)
     */
    static async getPolizasExpiringSoon(dias = 30) {
        try {
            const query = `
                SELECT 
                    ps.*,
                    v.num_economico,
                    v.placas,
                    v.marca,
                    v.modelo,
                    DATEDIFF(ps.fecha_vencimiento, CURDATE()) as dias_para_vencer
                FROM polizas_seguro ps
                INNER JOIN vehiculos v ON ps.id_vehiculo = v.id
                WHERE ps.activa = TRUE 
                AND ps.fecha_vencimiento > CURDATE()
                AND DATEDIFF(ps.fecha_vencimiento, CURDATE()) <= ?
                ORDER BY ps.fecha_vencimiento ASC
            `;

            const [polizas] = await pool.execute(query, [dias]);

            return polizas.map(poliza => ({
                ...poliza,
                vehiculo_info: `${poliza.num_economico} - ${poliza.marca} ${poliza.modelo} (${poliza.placas})`,
                url_descarga: poliza.nombre_archivo ? `/api/vehiculos/polizas/${poliza.id_poliza}/download` : null
            }));

        } catch (error) {
            logger.error(`Error al obtener pólizas próximas a vencer: ${error.message}`);
            throw error;
        }
    }

    // ========================================
    // FUNCIONES AUXILIARES
    // ========================================

    /**
     * Verificar si un archivo existe en el sistema
     * @param {string} rutaArchivo - Ruta del archivo
     */
    static async verificarArchivo(rutaArchivo) {
        try {
            await fs.access(rutaArchivo);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Obtener estadísticas de documentos de un vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    static async getEstadisticasDocumentos(vehiculoId) {
        try {
            const querys = {
                documentos: 'SELECT COUNT(*) as total FROM documentos_vehiculo WHERE id_vehiculo = ?',
                polizas: 'SELECT COUNT(*) as total FROM polizas_seguro WHERE id_vehiculo = ?',
                polizasActivas: 'SELECT COUNT(*) as total FROM polizas_seguro WHERE id_vehiculo = ? AND activa = TRUE',
                polizasPorVencer: `
                    SELECT COUNT(*) as total FROM polizas_seguro 
                    WHERE id_vehiculo = ? AND activa = TRUE 
                    AND fecha_vencimiento > CURDATE()
                    AND DATEDIFF(fecha_vencimiento, CURDATE()) <= 30
                `
            };

            const results = {};
            for (const [key, query] of Object.entries(querys)) {
                const [result] = await pool.execute(query, [vehiculoId]);
                results[key] = result[0].total;
            }

            return results;

        } catch (error) {
            logger.error(`Error al obtener estadísticas del vehículo ${vehiculoId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener todos los tipos de documentos únicos
     */
    static async getTiposDocumentos() {
        try {
            const query = 'SELECT DISTINCT tipo_documento FROM documentos_vehiculo ORDER BY tipo_documento';
            const [tipos] = await pool.execute(query);
            return tipos.map(t => t.tipo_documento);
        } catch (error) {
            logger.error(`Error al obtener tipos de documentos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener resumen de documentos por vehículo
     * @param {number} vehiculoId - ID del vehículo
     */
    static async getResumenDocumentos(vehiculoId) {
        try {
            const queryDocumentos = `
                SELECT 
                    tipo_documento,
                    COUNT(*) as cantidad,
                    MAX(fecha_subida) as ultimo_subido
                FROM documentos_vehiculo 
                WHERE id_vehiculo = ?
                GROUP BY tipo_documento
                ORDER BY tipo_documento
            `;

            const queryPolizas = `
                SELECT 
                    'Póliza de Seguro' as tipo,
                    COUNT(*) as cantidad,
                    SUM(CASE WHEN activa = TRUE THEN 1 ELSE 0 END) as activas,
                    MIN(fecha_vencimiento) as proxima_vencer
                FROM polizas_seguro 
                WHERE id_vehiculo = ? AND fecha_vencimiento > CURDATE()
            `;

            const [documentos] = await pool.execute(queryDocumentos, [vehiculoId]);
            const [polizas] = await pool.execute(queryPolizas, [vehiculoId]);

            return {
                documentos: documentos,
                polizas: polizas[0] || { cantidad: 0, activas: 0, proxima_vencer: null }
            };

        } catch (error) {
            logger.error(`Error al obtener resumen de documentos: ${error.message}`);
            throw error;
        }
    }
}

module.exports = DocsVehiculo;  