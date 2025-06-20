// src/controllers/vehiculo.controller.js
const Vehiculo = require('../models/Vehiculo.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

// ========================================
// FUNCIONES BÁSICAS DEL VEHÍCULO
// ========================================

// Crear un nuevo vehículo
exports.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const vehiculoData = req.body;

        // Verificar si el número económico ya existe
        const exists = await Vehiculo.checkNumEconomicoExists(vehiculoData.num_economico);
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'El número económico ya está en uso'
            });
        }

        const vehiculoId = await Vehiculo.create(vehiculoData);
        const vehiculo = await Vehiculo.getById(vehiculoId);
        res.status(201).json({
            success: true,
            message: 'Vehículo creado correctamente',
            data: { vehiculo }
        });
    } catch (error) {
        logger.error(`Error en create vehículo: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al crear vehículo',
            error: error.message
        });
    }
};

// Obtener todos los vehículos
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        
        const result = await Vehiculo.getAll({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            filters
        });
        
        const stats = await Vehiculo.getStats();
        
        res.json({
            success: true,
            data: {
                vehiculos: result.vehiculos,
                stats
            },
            pagination: result.pagination
        });
    } catch (error) {
        logger.error(`Error en getAll vehículos: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículos',
            error: error.message
        });
    }
};

// Obtener un vehículo por ID
exports.getById = async (req, res) => {
    try {
        const vehiculo = await Vehiculo.getById(req.params.id);
        if (!vehiculo) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }
        res.json({
            success: true,
            data: { vehiculo }
        });
    } catch (error) {
        logger.error(`Error en getById vehículo: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículo',
            error: error.message
        });
    }
};

// Actualizar vehículo
exports.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { id } = req.params;
        const { num_economico } = req.body;
        
        // Verificar si el número económico ya existe (excluyendo el vehículo actual)
        if (num_economico) {
            const exists = await Vehiculo.checkNumEconomicoExists(num_economico, id);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'El número económico ya está en uso'
                });
            }
        }
        
        const updated = await Vehiculo.update(id, req.body);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }
        
        const vehiculo = await Vehiculo.getById(id);
        res.json({
            success: true,
            message: 'Vehículo actualizado correctamente',
            data: { vehiculo }
        });
    } catch (error) {
        logger.error(`Error en update vehículo: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar vehículo',
            error: error.message
        });
    }
};

// Eliminar vehículo
exports.delete = async (req, res) => {
    try {
        const deleted = await Vehiculo.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Vehículo eliminado correctamente'
        });
    } catch (error) {
        logger.error(`Error en delete vehículo: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar vehículo',
            error: error.message
        });
    }
};

// Buscar vehículos
exports.search = async (req, res) => {
    try {
        const filters = req.query;
        const result = await Vehiculo.getAll({ filters });
        res.json({
            success: true,
            data: { vehiculos: result.vehiculos }
        });
    } catch (error) {
        logger.error(`Error en search vehículos: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al buscar vehículos',
            error: error.message
        });
    }
};

// Obtener estadísticas de vehículos
exports.getStats = async (req, res) => {
    try {
        const stats = await Vehiculo.getStats();
        res.json({
            success: true,
            data: { stats }
        });
    } catch (error) {
        logger.error(`Error en getStats vehículos: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

// Obtener flota
exports.getFlota = async (req, res) => {
    try {
        const flota = await Vehiculo.getFlota();
        res.json({
            success: true,
            data: { flota }
        });
    } catch (error) {
        logger.error(`Error en getFlota: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener flota',
            error: error.message
        });
    }
};

// ========================================
// FUNCIONES DE DOCUMENTOS
// ========================================

// Subir documento
exports.addDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_documento, descripcion } = req.body;
        const usuarioId = req.user?.id_usuario || 1;

        // Validaciones
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ningún archivo',
                error: 'Archivo requerido'
            });
        }

        if (!tipo_documento) {
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'El tipo de documento es requerido',
                error: 'Tipo de documento requerido'
            });
        }

        // Tipos de documentos permitidos
        const tiposPermitidos = [
            'Tarjeta de Circulación',
            'Factura',
            'Verificación',
            'Tenencia',
            'Licencia'
        ];

        if (!tiposPermitidos.includes(tipo_documento)) {
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Tipo de documento no válido',
                error: `Tipos permitidos: ${tiposPermitidos.join(', ')}`
            });
        }

        // Crear documento
        const documento = await Vehiculo.addDocument(
            parseInt(id),
            tipo_documento,
            req.file,
            usuarioId,
            descripcion
        );

        res.status(201).json({
            success: true,
            message: 'Documento subido correctamente',
            data: { documento }
        });

    } catch (error) {
        logger.error(`Error al subir documento: ${error.message}`);
        
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error(`Error al limpiar archivo: ${unlinkError.message}`);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener documentos
exports.getDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.query;

        let documentos;
        if (tipo) {
            documentos = await Vehiculo.getDocumentsByType(parseInt(id), tipo);
        } else {
            documentos = await Vehiculo.getDocuments(parseInt(id));
        }

        res.json({
            success: true,
            message: 'Documentos obtenidos correctamente',
            data: {
                documentos,
                count: documentos.length
            }
        });

    } catch (error) {
        logger.error(`Error al obtener documentos: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener documentos por tipo
exports.getDocumentsByType = async (req, res) => {
    try {
        const { id, tipo } = req.params;

        const documentos = await Vehiculo.getDocumentsByType(parseInt(id), tipo);

        res.json({
            success: true,
            message: `Documentos de tipo '${tipo}' obtenidos correctamente`,
            data: {
                documentos,
                count: documentos.length,
                tipo_documento: tipo
            }
        });

    } catch (error) {
        logger.error(`Error al obtener documentos por tipo: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar documento
exports.updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { tipo_documento, descripcion } = req.body;
        const usuarioId = req.user?.id_usuario || 1;

        // Verificar que el documento existe
        const documentoExistente = await Vehiculo.getDocumentById(parseInt(documentId));
        if (!documentoExistente) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        // Verificar permisos
        if (documentoExistente.subido_por !== usuarioId && !req.user?.es_admin) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para actualizar este documento'
            });
        }

        // Validar tipo de documento si se proporciona
        if (tipo_documento) {
            const tiposPermitidos = [
                'Tarjeta de Circulación',
                'Factura',
                'Verificación',
                'Tenencia',
                'Licencia'
            ];

            if (!tiposPermitidos.includes(tipo_documento)) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de documento no válido',
                    error: `Tipos permitidos: ${tiposPermitidos.join(', ')}`
                });
            }
        }

        // Preparar datos para actualización
        const nuevosDatos = {};
        if (tipo_documento) nuevosDatos.tipo_documento = tipo_documento;
        if (descripcion !== undefined) nuevosDatos.descripcion = descripcion;
        if (req.file) nuevosDatos.archivo = req.file;

        // Actualizar documento
        const documentoActualizado = await Vehiculo.updateDocument(parseInt(documentId), nuevosDatos);

        res.json({
            success: true,
            message: 'Documento actualizado correctamente',
            data: { documento: documentoActualizado }
        });

    } catch (error) {
        logger.error(`Error al actualizar documento: ${error.message}`);
        
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error(`Error al limpiar archivo: ${unlinkError.message}`);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar documento
exports.deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const usuarioId = req.user?.id_usuario || 1;

        // Verificar que el documento existe
        const documentoExistente = await Vehiculo.getDocumentById(parseInt(documentId));
        if (!documentoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        // Verificar permisos
        if (documentoExistente.subido_por !== usuarioId && !req.user?.es_admin) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para eliminar este documento'
            });
        }

        // Eliminar documento
        const documentoEliminado = await Vehiculo.deleteDocument(parseInt(documentId));

        res.json({
            success: true,
            message: 'Documento eliminado correctamente',
            data: { documento: documentoEliminado }
        });

    } catch (error) {
        logger.error(`Error al eliminar documento: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Descargar documento
exports.downloadDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        // Obtener información del documento
        const documento = await Vehiculo.getDocumentById(parseInt(documentId));
        if (!documento) {
            return res.status(404).json({
                success: false,
                message: 'Documento no encontrado'
            });
        }

        // Verificar que el archivo existe
        const archivoExiste = await Vehiculo.verificarArchivo(documento.ruta_archivo);
        if (!archivoExiste) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado en el servidor'
            });
        }

        // Configurar headers para descarga
        const fileName = documento.nombre_archivo;
        const filePath = documento.ruta_archivo;

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Enviar archivo
        res.sendFile(path.resolve(filePath));

    } catch (error) {
        logger.error(`Error al descargar documento: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ========================================
// FUNCIONES DE PÓLIZAS
// ========================================

// Crear póliza
exports.addPoliza = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            numero_poliza,
            aseguradora,
            tipo_cobertura,
            fecha_inicio,
            fecha_vencimiento,
            monto_cobertura,
            prima_anual,
            deducible,
            beneficiario,
            observaciones,
            activa
        } = req.body;

        // Validaciones obligatorias
        if (!numero_poliza || !aseguradora || !fecha_inicio || !fecha_vencimiento) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios',
                error: 'numero_poliza, aseguradora, fecha_inicio y fecha_vencimiento son requeridos'
            });
        }

        // Validar fechas
        const fechaInicio = new Date(fecha_inicio);
        const fechaVencimiento = new Date(fecha_vencimiento);

        if (fechaVencimiento <= fechaInicio) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'La fecha de vencimiento debe ser posterior a la fecha de inicio'
            });
        }

        // Preparar datos de la póliza
        const datosPoliza = {
            numero_poliza,
            aseguradora,
            tipo_cobertura,
            fecha_inicio,
            fecha_vencimiento,
            monto_cobertura: monto_cobertura ? parseFloat(monto_cobertura) : null,
            prima_anual: prima_anual ? parseFloat(prima_anual) : null,
            deducible: deducible ? parseFloat(deducible) : null,
            beneficiario,
            observaciones,
            activa: activa !== undefined ? Boolean(activa) : true
        };

        // Crear póliza
        const poliza = await Vehiculo.addPoliza(
            parseInt(id),
            datosPoliza,
            req.file
        );

        res.status(201).json({
            success: true,
            message: 'Póliza creada correctamente',
            data: { poliza }
        });

    } catch (error) {
        logger.error(`Error al crear póliza: ${error.message}`);
        
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error(`Error al limpiar archivo: ${unlinkError.message}`);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener pólizas
exports.getPolizas = async (req, res) => {
    try {
        const { id } = req.params;
        const { activa } = req.query;

        let polizas = await Vehiculo.getPolizas(parseInt(id));

        // Filtrar por estado activo si se especifica
        if (activa !== undefined) {
            const filtroActiva = activa === 'true';
            polizas = polizas.filter(poliza => poliza.activa === filtroActiva);
        }

        res.json({
            success: true,
            message: 'Pólizas obtenidas correctamente',
            data: {
                polizas,
                count: polizas.length,
                activas: polizas.filter(p => p.activa).length,
                por_vencer: polizas.filter(p => p.estado === 'por_vencer').length,
                vencidas: polizas.filter(p => p.estado === 'vencida').length
            }
        });

    } catch (error) {
        logger.error(`Error al obtener pólizas: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar póliza
exports.updatePoliza = async (req, res) => {
    try {
        const { polizaId } = req.params;
        const {
            numero_poliza,
            aseguradora,
            tipo_cobertura,
            fecha_inicio,
            fecha_vencimiento,
            monto_cobertura,
            prima_anual,
            deducible,
            beneficiario,
            observaciones,
            activa
        } = req.body;

        // Verificar que la póliza existe
        const polizaExistente = await Vehiculo.getPolizaById(parseInt(polizaId));
        if (!polizaExistente) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Póliza no encontrada'
            });
        }

        // Validar fechas si se proporcionan
        if (fecha_inicio && fecha_vencimiento) {
            const fechaInicio = new Date(fecha_inicio);
            const fechaVencimiento = new Date(fecha_vencimiento);

            if (fechaVencimiento <= fechaInicio) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de vencimiento debe ser posterior a la fecha de inicio'
                });
            }
        }

        // Preparar datos para actualización
        const nuevosDatos = {};
        if (numero_poliza) nuevosDatos.numero_poliza = numero_poliza;
        if (aseguradora) nuevosDatos.aseguradora = aseguradora;
        if (tipo_cobertura !== undefined) nuevosDatos.tipo_cobertura = tipo_cobertura;
        if (fecha_inicio) nuevosDatos.fecha_inicio = fecha_inicio;
        if (fecha_vencimiento) nuevosDatos.fecha_vencimiento = fecha_vencimiento;
        if (monto_cobertura !== undefined) nuevosDatos.monto_cobertura = monto_cobertura ? parseFloat(monto_cobertura) : null;
        if (prima_anual !== undefined) nuevosDatos.prima_anual = prima_anual ? parseFloat(prima_anual) : null;
        if (deducible !== undefined) nuevosDatos.deducible = deducible ? parseFloat(deducible) : null;
        if (beneficiario !== undefined) nuevosDatos.beneficiario = beneficiario;
        if (observaciones !== undefined) nuevosDatos.observaciones = observaciones;
        if (activa !== undefined) nuevosDatos.activa = Boolean(activa);

        // Actualizar póliza
        const polizaActualizada = await Vehiculo.updatePoliza(
            parseInt(polizaId),
            nuevosDatos,
            req.file
        );

        res.json({
            success: true,
            message: 'Póliza actualizada correctamente',
            data: { poliza: polizaActualizada }
        });

    } catch (error) {
        logger.error(`Error al actualizar póliza: ${error.message}`);
        
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error(`Error al limpiar archivo: ${unlinkError.message}`);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Eliminar póliza
exports.deletePoliza = async (req, res) => {
    try {
        const { polizaId } = req.params;

        const polizaExistente = await Vehiculo.getPolizaById(parseInt(polizaId));
        if (!polizaExistente) {
            return res.status(404).json({
                success: false,
                message: 'Póliza no encontrada'
            });
        }

        const polizaEliminada = await Vehiculo.deletePoliza(parseInt(polizaId));

        res.json({
            success: true,
            message: 'Póliza eliminada correctamente',
            data: { poliza: polizaEliminada }
        });

    } catch (error) {
        logger.error(`Error al eliminar póliza: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Descargar póliza
exports.downloadPoliza = async (req, res) => {
    try {
        const { polizaId } = req.params;

        const poliza = await Vehiculo.getPolizaById(parseInt(polizaId));
        if (!poliza) {
            return res.status(404).json({
                success: false,
                message: 'Póliza no encontrada'
            });
        }

        if (!poliza.nombre_archivo || !poliza.ruta_archivo) {
            return res.status(404).json({
                success: false,
                message: 'Esta póliza no tiene archivo asociado'
            });
        }

        const archivoExiste = await Vehiculo.verificarArchivo(poliza.ruta_archivo);
        if (!archivoExiste) {
            return res.status(404).json({
                success: false,
                message: 'Archivo no encontrado en el servidor'
            });
        }

        const fileName = poliza.nombre_archivo;
        const filePath = poliza.ruta_archivo;

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        res.sendFile(path.resolve(filePath));

    } catch (error) {
        logger.error(`Error al descargar póliza: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener pólizas próximas a vencer
exports.getPolizasExpiringSoon = async (req, res) => {
    try {
        const { dias = 30 } = req.query;

        const polizas = await Vehiculo.getPolizasExpiringSoon(parseInt(dias));

        res.json({
            success: true,
            message: `Pólizas próximas a vencer en ${dias} días`,
            data: {
                polizas,
                count: polizas.length,
                dias_alerta: parseInt(dias)
            }
        });

    } catch (error) {
        logger.error(`Error al obtener pólizas próximas a vencer: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Obtener estadísticas de documentos
exports.getEstadisticasDocumentos = async (req, res) => {
    try {
        const { id } = req.params;

        const estadisticas = await Vehiculo.getEstadisticasDocumentos(parseInt(id));

        res.json({
            success: true,
            message: 'Estadísticas obtenidas correctamente',
            data: {
                vehiculo_id: parseInt(id),
                estadisticas
            }
        });

    } catch (error) {
        logger.error(`Error al obtener estadísticas: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};