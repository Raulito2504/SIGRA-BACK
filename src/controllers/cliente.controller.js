// File: src/controllers/cliente.controller.js
const Cliente = require('../models/Cliente.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');


exports.createCliente = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        const clienteId = await Cliente.create(req.body);
        const cliente = await Cliente.getById(clienteId);
        
        res.status(201).json({
            success: true,
            message: 'Cliente creado correctamente',
            data: { cliente }
        });
    } catch (error) {
        logger.error(`Error al crear cliente: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener todos los clientes con filtros opcionales
 */
exports.getAllClientes = async (req, res) => {
    try {
        logger.info('Iniciando getAllClientes');
        logger.info(`Query params recibidos: ${JSON.stringify(req.query)}`);
        
        // Extraer y validar parámetros de consulta
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Construir filtros desde query parameters
        const filters = {};
        if (req.query.nombre && req.query.nombre.trim()) {
            filters.nombre = req.query.nombre.trim();
        }
        if (req.query.telefono && req.query.telefono.trim()) {
            filters.telefono = req.query.telefono.trim();
        }
        if (req.query.correo_electronico && req.query.correo_electronico.trim()) {
            filters.correo_electronico = req.query.correo_electronico.trim();
        }
        
        logger.info(`Parámetros procesados: page=${page}, limit=${limit}, filters=${JSON.stringify(filters)}`);
        
        const result = await Cliente.getAll({
            page,
            limit,
            filters
        });
        
        logger.info('Cliente.getAll ejecutado exitosamente');
        
        res.json({
            success: true,
            message: 'Clientes obtenidos correctamente',
            data: {
                clientes: result.clientes,
                pagination: result.pagination
            }
        });
    } catch (error) {
        logger.error(`Error en getAllClientes: ${error.message}`);
        logger.error(`Stack completo: ${error.stack}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener cliente por ID
 */
exports.getClienteById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validar que el ID sea un número válido
        if (!id || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de cliente inválido'
            });
        }
        
        const cliente = await Cliente.getById(id);
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente obtenido correctamente',
            data: { cliente }
        });
    } catch (error) {
        logger.error(`Error al obtener cliente: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Actualizar cliente
 */
exports.updateCliente = async (req, res) => {
    try {
        // Verificar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        const id = parseInt(req.params.id);
        
        // Validar que el ID sea un número válido
        if (!id || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de cliente inválido'
            });
        }
        
        const actualizado = await Cliente.update(id, req.body);
        if (!actualizado) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente actualizado correctamente'
        });
    } catch (error) {
        logger.error(`Error al actualizar cliente: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Eliminar cliente (borrado lógico)
 */
exports.deleteCliente = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validar que el ID sea un número válido
        if (!id || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de cliente inválido'
            });
        }
        
        const eliminado = await Cliente.delete(id);
        if (!eliminado) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente eliminado correctamente'
        });
    } catch (error) {
        logger.error(`Error al eliminar cliente: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};