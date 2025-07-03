// src/controllers/contratos.controller.js
const Contrato = require('../models/Contrato.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * @route   POST /api/contratos
 * @desc    Crear nuevo contrato
 * @access  Private
 */
exports.createContrato = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const contratoData = {
            num_contrato: req.body.num_contrato,
            dias: req.body.dias,
            lugar_expedicion: req.body.lugar_expedicion,
            fecha_expedicion: req.body.fecha_expedicion,
            fecha_vencimiento: req.body.fecha_vencimiento,
            monto_total: parseFloat(req.body.monto_total),
            monto_anticipo: parseFloat(req.body.monto_anticipo),
            id_tipo_contrato: parseInt(req.body.id_tipo_contrato),
            id_cliente: parseInt(req.body.id_cliente),
            id_vehiculo: parseInt(req.body.id_vehiculo),
            id_usuario: parseInt(req.user?.id_usuario || 1)
        };

        const contratoId = await Contrato.create(contratoData);
        const contrato = await Contrato.getById(contratoId);

        res.status(201).json({
            success: true,
            message: 'Contrato creado correctamente',
            data: { contrato }
        });
    } catch (error) {
        logger.error(`Error al crear contrato: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/contratos
 * @desc    Obtener lista de contratos
 * @access  Private
 */
exports.getAllContratos = async (req, res) => {
    try {
        const { page = 1, limit = 10, ...filters } = req.query;
        const result = await Contrato.getAll({ page, limit, filters });
        res.json({
            success: true,
            message: 'Lista de contratos obtenida correctamente',
            data: { contratos: result },
            pagination: {
                total: result.length,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        logger.error(`Error al obtener contratos: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/contratos/:id
 * @desc    Obtener contrato por ID
 * @access  Private
 */
exports.getContratoById = async (req, res) => {
    try {
        const contrato = await Contrato.getById(parseInt(req.params.id));
        if (!contrato) {
            return res.status(404).json({
                success: false,
                message: 'Contrato no encontrado'
            });
        }
        res.json({
            success: true,
            data: { contrato }
        });
    } catch (error) {
        logger.error(`Error al obtener contrato: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/contratos/:id/status
 * @desc    Cambiar estado del contrato
 * @access  Private
 */
exports.updateContratoStatus = async (req, res) => {
    try {
        const { estado } = req.body;
        const contratoActualizado = await Contrato.updateStatus(parseInt(req.params.id), estado);
        if (!contratoActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Contrato no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Estado del contrato actualizado correctamente',
            data: { estado }
        });
    } catch (error) {
        logger.error(`Error al actualizar estado del contrato: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/contratos/:id
 * @desc    Eliminar contrato
 * @access  Private
 */
exports.deleteContrato = async (req, res) => {
    try {
        const contratoEliminado = await Contrato.delete(parseInt(req.params.id));
        if (!contratoEliminado) {
            return res.status(404).json({
                success: false,
                message: 'Contrato no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Contrato eliminado correctamente'
        });
    } catch (error) {
        logger.error(`Error al eliminar contrato: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};