// src/middleware/contrato.validation.middleware.js
const { check, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validación para crear contrato
 */
const create = [
    check('num_contrato')
        .notEmpty().withMessage('El número de contrato es requerido')
        .isLength({ max: 20 }).withMessage('Máximo 20 caracteres'),
    check('dias')
        .notEmpty().withMessage('Los días son requeridos')
        .isInt({ min: 1 }).withMessage('Debe ser un número entero positivo'),
    check('lugar_expedicion')
        .notEmpty().withMessage('El lugar de expedición es requerido')
        .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
    check('fecha_expedicion')
        .notEmpty().withMessage('La fecha de expedición es requerida')
        .isISO8601().withMessage('Formato de fecha inválido'),
    check('fecha_vencimiento')
        .notEmpty().withMessage('La fecha de vencimiento es requerida')
        .isISO8601().withMessage('Formato de fecha inválido'),
    check('monto_total')
        .notEmpty().withMessage('El monto total es requerido')
        .isDecimal().withMessage('Debe ser un número decimal válido'),
    check('monto_anticipo')
        .notEmpty().withMessage('El monto de anticipo es requerido')
        .isDecimal().withMessage('Debe ser un número decimal válido'),
    check('id_tipo_contrato')
        .notEmpty().withMessage('El tipo de contrato es requerido')
        .isInt().withMessage('Debe ser un ID válido'),
    check('id_cliente')
        .notEmpty().withMessage('El cliente es requerido')
        .isInt().withMessage('Debe ser un ID válido'),
    check('id_vehiculo')
        .notEmpty().withMessage('El vehículo es requerido')
        .isInt().withMessage('Debe ser un ID válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validación para cambiar estado
 */
const updateStatus = [
    check('estado')
        .notEmpty().withMessage('El estado es requerido')
        .isIn(['activo', 'completado', 'cancelado']).withMessage('Estado no válido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = {
    create,
    updateStatus
};