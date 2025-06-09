// src/controllers/vehiculo.controller.js
const Vehiculo = require('../models/Vehiculo.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

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
        const { caracteristicas, ...vehiculoData } = req.body;

        // Verificar si el número económico ya existe
        const numEconomicoExists = await Vehiculo.checkNumEconomicoExists(vehiculoData.num_economico);
        if (numEconomicoExists) {
            return res.status(400).json({
                success: false,
                message: 'El número económico ya está en uso'
            });
        }

        const vehiculoId = await Vehiculo.create(vehiculoData);

        // Si hay características, asignarlas al vehículo
        if (caracteristicas && caracteristicas.length > 0) {
            await Vehiculo.updateCaracteristicas(vehiculoId, caracteristicas);
        }

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

// Obtener todos los vehículos con paginación y filtros
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;

        const result = await Vehiculo.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            filters
        });

        // Obtener estadísticas para el dashboard
        const stats = await Vehiculo.getStats();

        res.json({
            success: true,
            message: 'Vehículos obtenidos correctamente',
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
        const { caracteristicas, ...vehiculoData } = req.body;

        // Verificar si el número económico ya existe (excluyendo el vehículo actual)
        if (vehiculoData.num_economico) {
            const numEconomicoExists = await Vehiculo.checkNumEconomicoExists(vehiculoData.num_economico, id);
            if (numEconomicoExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El número económico ya está en uso'
                });
            }
        }

        const updated = await Vehiculo.update(id, vehiculoData);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        // Actualizar características si se proporcionan
        if (caracteristicas) {
            await Vehiculo.updateCaracteristicas(id, caracteristicas);
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
// Actualizar parcialmente un vehículo
exports.partialUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validación básica
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        // Actualización en la base de datos
        const [result] = await db.query(
            'UPDATE vehiculos SET ? WHERE id = ?',
            [updateData, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        const vehiculoActualizado = await Vehiculo.getById(id);

        res.json({
            success: true,
            message: 'Vehículo actualizado parcialmente',
            data: vehiculoActualizado
        });
    } catch (error) {
        logger.error(`Error en partialUpdate: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar vehículo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Obtener vista de flota
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
            message: 'Error al obtener vista de flota',
            error: error.message
        });
    }
};

// Obtener catálogos
exports.getCatalogs = async (req, res) => {
    try {
        const catalogs = await Vehiculo.getCatalogs();

        res.json({
            success: true,
            data: catalogs
        });
    } catch (error) {
        logger.error(`Error en getCatalogs: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener catálogos',
            error: error.message
        });
    }
};

// Búsqueda avanzada de vehículos
exports.search = async (req, res) => {
    try {
        const filters = req.query;
        const result = await Vehiculo.getAll({ filters });

        res.json({
            success: true,
            data: {
                vehiculos: result.vehiculos
            }
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

// Obtener vehículos con información de pólizas
exports.getWithPolizas = async (req, res) => {
    try {
        const vehiculos = await Vehiculo.getWithPolizas();

        res.json({
            success: true,
            data: { vehiculos }
        });
    } catch (error) {
        logger.error(`Error en getWithPolizas: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener vehículos con pólizas',
            error: error.message
        });
    }
};

// Agregar documento a vehículo
exports.addDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_documento } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ningún archivo'
            });
        }

        const documentId = await Vehiculo.addDocument(
            id,
            tipo_documento,
            req.file.filename
        );

        res.status(201).json({
            success: true,
            message: 'Documento agregado correctamente',
            data: { documentId }
        });
    } catch (error) {
        logger.error(`Error en addDocument: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al agregar documento',
            error: error.message
        });
    }
};

// Obtener documentos de vehículo
exports.getDocuments = async (req, res) => {
    try {
        const { id } = req.params;
        const vehiculo = await Vehiculo.getById(id);

        if (!vehiculo) {
            return res.status(404).json({
                success: false,
                message: 'Vehículo no encontrado'
            });
        }

        res.json({
            success: true,
            data: { documentos: vehiculo.documentos }
        });
    } catch (error) {
        logger.error(`Error en getDocuments: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al obtener documentos',
            error: error.message
        });
    }
};