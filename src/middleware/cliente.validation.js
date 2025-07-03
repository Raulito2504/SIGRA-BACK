// src/middleware/clientes.validation.js
const { check, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validación para búsqueda de clientes
 */
const search = [
    check('nombre').optional().isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
    check('telefono').optional().isLength({ max: 20 }).withMessage('Máximo 20 caracteres')
];

/**
 * Validación para crear cliente
 */
const create = [
    check('nombre_completo')
        .notEmpty().withMessage('El nombre completo es requerido')
        .isLength({ max: 150 }).withMessage('Máximo 150 caracteres'),
    check('domicilio_hotel')
        .notEmpty().withMessage('El domicilio/hotel es requerido')
        .isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),
    check('ciudad')
        .notEmpty().withMessage('La ciudad es requerida')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    check('telefono')
        .notEmpty().withMessage('El teléfono es requerido')
        .isLength({ max: 20 }).withMessage('Máximo 20 caracteres'),
    check('licencia_conducir')
        .notEmpty().withMessage('La licencia de conducir es requerida')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
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
    search,
    create
};