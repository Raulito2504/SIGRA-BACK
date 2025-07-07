// src/middleware/cliente.validation.js
const { check, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Validación para búsqueda de clientes
 */
const search = [
    check('nombre')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres'),
    check('telefono')
        .optional()
        .isLength({ max: 20 })
        .withMessage('Máximo 20 caracteres'),
    check('correo_electronico')
        .optional()
        .isEmail()
        .withMessage('Formato de email inválido')
        .isLength({ max: 100 })
        .withMessage('Máximo 100 caracteres'),
    check('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),
    check('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser entre 1 y 100'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación en parámetros de búsqueda',
                errors: errors.array()
            });
        }
        next();
    }
];

/**
 * Validación para crear/actualizar cliente
 */
const create = [
    check('nombre_completo')
        .notEmpty()
        .withMessage('El nombre completo es requerido')
        .isLength({ min: 2, max: 150 })
        .withMessage('El nombre debe tener entre 2 y 150 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    check('domicilio_hotel')
        .notEmpty()
        .withMessage('El domicilio/hotel es requerido')
        .isLength({ min: 5, max: 200 })
        .withMessage('El domicilio debe tener entre 5 y 200 caracteres'),
    
    check('ciudad')
        .notEmpty()
        .withMessage('La ciudad es requerida')
        .isLength({ min: 2, max: 50 })
        .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/)
        .withMessage('La ciudad solo puede contener letras y espacios'),
    
    check('telefono')
        .notEmpty()
        .withMessage('El teléfono es requerido')
        .isLength({ min: 10, max: 20 })
        .withMessage('El teléfono debe tener entre 10 y 20 caracteres')
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Formato de teléfono inválido'),
    
    check('licencia_conducir')
        .notEmpty()
        .withMessage('La licencia de conducir es requerida')
        .isLength({ min: 5, max: 50 })
        .withMessage('La licencia debe tener entre 5 y 50 caracteres')
        .matches(/^[a-zA-Z0-9\-]+$/)
        .withMessage('La licencia solo puede contener letras, números y guiones'),
    
    check('correo_electronico')
        .optional()
        .isEmail()
        .withMessage('Formato de email inválido')
        .isLength({ max: 100 })
        .withMessage('El email no puede exceder 100 caracteres'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn(`Errores de validación: ${JSON.stringify(errors.array())}`);
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
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