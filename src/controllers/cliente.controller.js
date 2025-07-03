// src/controllers/cliente.controller.js
const Cliente = require('../models/Cliente.model');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * @route   GET /api/clientes/search
 * @desc    Buscar clientes existentes
 * @access  Private
 */
exports.searchClientes = async (req, res) => {
    try {
        const { nombre, telefono } = req.query;
        const clientes = await Cliente.search(nombre, telefono);
        res.json({
            success: true,
            message: 'Clientes encontrados',
            data: { clientes }
        });
    } catch (error) {
        logger.error(`Error al buscar clientes: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Private
 */
exports.createCliente = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const clienteData = {
            nombre_completo: req.body.nombre_completo,
            domicilio_hotel: req.body.domicilio_hotel,
            ciudad: req.body.ciudad,
            telefono: req.body.telefono,
            licencia_conducir: req.body.licencia_conducir,
            correo_electronico: req.body.correo_electronico
        };

        const clienteId = await Cliente.create(clienteData);
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