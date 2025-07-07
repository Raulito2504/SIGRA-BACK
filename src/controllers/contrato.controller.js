// src/controllers/contratos.controller.js
const Contrato = require('../models/Contrato.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const PDFDocument = require('pdfkit');
const fs = require('fs');
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
            dias_renta: req.body.dias_renta,
            lugar_expedicion: req.body.lugar_expedicion,
            fecha_salida: req.body.fecha_salida,
            fecha_entrada: req.body.fecha_entrada,
            id_cliente: parseInt(req.body.id_cliente),
            id_vehiculo: parseInt(req.body.id_vehiculo),
            id_usuario: parseInt(req.user?.id_usuario || 1),
            id_agencia: req.body.id_agencia ? parseInt(req.body.id_agencia) : null,
            subtotal: parseFloat(req.body.subtotal),
            iva: parseFloat(req.body.iva),
            total: parseFloat(req.body.total),
            id_tipo_cambio: req.body.id_tipo_cambio ? parseInt(req.body.id_tipo_cambio) : 1,
            km_salida: req.body.km_salida ? parseInt(req.body.km_salida) : 0,
            gasolina_salida: req.body.gasolina_salida ? parseFloat(req.body.gasolina_salida) : 8.0
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
/**
 * @route   GET /api/contratos/:id/pdf
 * @desc    Descargar contrato como PDF
 * @access  Private
 */
exports.downloadContratoPDF = async (req, res) => {
    try {
        const contrato = await Contrato.getById(parseInt(req.params.id));
        if (!contrato) {
            return res.status(404).json({
                success: false,
                message: 'Contrato no encontrado'
            });
        }

        // Aquí puedes personalizar el PDF según tus necesidades
        const doc = new PDFDocument();
        let filename = `Contrato_${contrato.num_contrato}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.text(`Contrato: ${contrato.num_contrato}`);
        doc.text(`Cliente: ${contrato.id_cliente}`);
        doc.text(`Vehículo: ${contrato.id_vehiculo}`);
        doc.text(`Fecha expedición: ${contrato.fecha_expedicion}`);
        // ...agrega más campos según tu modelo...

        doc.pipe(res);
        doc.end();
    } catch (error) {
        logger.error(`Error al generar PDF del contrato: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error al generar PDF',
            error: error.message
        });
    }
};