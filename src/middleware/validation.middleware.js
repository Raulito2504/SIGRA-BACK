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

  check('id_marca')
    .notEmpty().withMessage('La marca es requerida')
    .isInt().withMessage('Debe ser un ID válido'),

  check('id_modelo')
    .notEmpty().withMessage('El modelo es requerido')
    .isInt().withMessage('Debe ser un ID válido'),

  check('id_color')
    .notEmpty().withMessage('El color es requerido')
    .isInt().withMessage('Debe ser un ID válido'),

  check('id_tipo_auto')
    .notEmpty().withMessage('El tipo de auto es requerido')
    .isInt().withMessage('Debe ser un ID válido'),

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