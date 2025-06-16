// src/middleware/validation.middleware.js
const { check, validationResult } = require('express-validator');

exports.validateVehiculo = [
    check('num_economico')
        .notEmpty().withMessage('El número económico es requerido')
        .isLength({ max: 10 }).withMessage('Máximo 10 caracteres'),

    check('placas')
        .notEmpty().withMessage('Las placas son requeridas')
        .isLength({ max: 20 }).withMessage('Máximo 20 caracteres'),

    check('motor')
        .notEmpty().withMessage('El motor es requerido')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

    check('numero_serie')
        .notEmpty().withMessage('El número de serie es requerido')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

    check('marca')
        .notEmpty().withMessage('La marca es requerida')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

    check('modelo')
        .notEmpty().withMessage('El modelo es requerido')   
        .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

    check('id_estatus')
        .notEmpty().withMessage('El estatus es requerido')
        .isInt().withMessage('Debe ser un ID válido'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
// Validación de documentos
exports.validateDocument = [
    check('tipo_documento')
        .notEmpty().withMessage('El tipo de documento es requerido')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validación para registro de usuario
exports.validateRegister = [
    check('nombre_usuario')
        .notEmpty().withMessage('El nombre de usuario es requerido')
        .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

    check('email')
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Debe ser un email válido')
        .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

    check('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),

    check('nombre_completo')
        .notEmpty().withMessage('El nombre completo es requerido')
        .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

    check('id_rol')
        .notEmpty().withMessage('El rol es requerido')
        .isInt().withMessage('Debe ser un ID válido'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];  