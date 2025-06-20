// src/middleware/validation.middleware.js
const { check, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs').promises;

const validateVehiculo = [
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

// Validación para registro de usuario
const validateRegister = [
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
// src/middleware/validation.middleware.js

// Tipos de documentos permitidos
const TIPOS_DOCUMENTOS_PERMITIDOS = [
    'Tarjeta de Circulación',
    'Factura',
    'Verificación',
    'Tenencia',
    'Licencia'
];

// Tipos de cobertura permitidos para pólizas
const TIPOS_COBERTURA_PERMITIDOS = [
    'Responsabilidad Civil',
    'Cobertura Limitada',
    'Cobertura Amplia',
    'Cobertura Total'
];

/**
 * Middleware para validar datos de documentos generales
 */
const validarDocumento = async (req, res, next) => {
    try {
        const { tipo_documento } = req.body;
        const { documentId } = req.params;

        // Si es actualización y no hay archivo ni tipo_documento, permitir continuar
        if (documentId && !req.file && !tipo_documento) {
            return next();
        }

        // Para crear nuevo documento, tipo_documento es obligatorio
        if (!documentId && !tipo_documento) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'El tipo de documento es requerido',
                error: 'tipo_documento es obligatorio para crear documentos'
            });
        }

        // Validar tipo de documento si se proporciona
        if (tipo_documento && !TIPOS_DOCUMENTOS_PERMITIDOS.includes(tipo_documento)) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Tipo de documento no válido',
                error: `Tipos permitidos: ${TIPOS_DOCUMENTOS_PERMITIDOS.join(', ')}`
            });
        }

        // Validar descripción si se proporciona
        if (req.body.descripcion && req.body.descripcion.length > 500) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'La descripción es demasiado larga',
                error: 'Máximo 500 caracteres permitidos'
            });
        }

        next();

    } catch (error) {
        logger.error(`Error en validación de documento: ${error.message}`);
        
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error(`Error al limpiar archivo: ${unlinkError.message}`);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno en validación',
            error: error.message
        });
    }
};

/**
 * Middleware para validar datos de pólizas de seguro
 */
const validarPoliza = async (req, res, next) => {
    try {
        const {
            numero_poliza,
            aseguradora,
            fecha_inicio,
            fecha_vencimiento,
            tipo_cobertura,
            monto_cobertura,
            prima_anual,
            deducible
        } = req.body;
        const { polizaId } = req.params;

        // Para crear nueva póliza, campos obligatorios
        if (!polizaId) {
            const camposObligatorios = [
                { campo: 'numero_poliza', valor: numero_poliza },
                { campo: 'aseguradora', valor: aseguradora },
                { campo: 'fecha_inicio', valor: fecha_inicio },
                { campo: 'fecha_vencimiento', valor: fecha_vencimiento }
            ];

            for (const { campo, valor } of camposObligatorios) {
                if (!valor) {
                    if (req.file) {
                        await fs.unlink(req.file.path);
                    }
                    return res.status(400).json({
                        success: false,
                        message: `El campo ${campo} es obligatorio`,
                        error: `${campo} es requerido para crear pólizas`
                    });
                }
            }
        }

        // Validar número de póliza
        if (numero_poliza) {
            if (numero_poliza.length < 3 || numero_poliza.length > 50) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Número de póliza inválido',
                    error: 'El número de póliza debe tener entre 3 y 50 caracteres'
                });
            }
        }

        // Validar aseguradora
        if (aseguradora) {
            if (aseguradora.length < 2 || aseguradora.length > 100) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Nombre de aseguradora inválido',
                    error: 'El nombre de la aseguradora debe tener entre 2 y 100 caracteres'
                });
            }
        }

        // Validar tipo de cobertura
        if (tipo_cobertura && !TIPOS_COBERTURA_PERMITIDOS.includes(tipo_cobertura)) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Tipo de cobertura no válido',
                error: `Tipos permitidos: ${TIPOS_COBERTURA_PERMITIDOS.join(', ')}`
            });
        }

        // Validar fechas
        if (fecha_inicio && fecha_vencimiento) {
            const fechaInicio = new Date(fecha_inicio);
            const fechaVencimiento = new Date(fecha_vencimiento);
            const fechaActual = new Date();

            // Verificar que las fechas sean válidas
            if (isNaN(fechaInicio.getTime()) || isNaN(fechaVencimiento.getTime())) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Fechas inválidas',
                    error: 'Las fechas deben tener un formato válido (YYYY-MM-DD)'
                });
            }

            // Verificar que la fecha de vencimiento sea posterior a la fecha de inicio
            if (fechaVencimiento <= fechaInicio) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Fechas inválidas',
                    error: 'La fecha de vencimiento debe ser posterior a la fecha de inicio'
                });
            }

            // Advertir si la póliza ya está vencida (solo advertencia, no error)
            if (fechaVencimiento < fechaActual) {
                logger.warn(`Póliza con fecha de vencimiento pasada: ${fecha_vencimiento}`);
            }
        }

        // Validar monto de cobertura
        if (monto_cobertura !== undefined) {
            const monto = parseFloat(monto_cobertura);
            if (isNaN(monto) || monto <= 0) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Monto de cobertura inválido',
                    error: 'El monto de cobertura debe ser un número positivo'
                });
            }
            if (monto > 99999999.99) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Monto de cobertura demasiado alto',
                    error: 'El monto máximo permitido es 99,999,999.99'
                });
            }
        }

        // Validar prima anual
        if (prima_anual !== undefined) {
            const prima = parseFloat(prima_anual);
            if (isNaN(prima) || prima <= 0) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Prima anual inválida',
                    error: 'La prima anual debe ser un número positivo'
                });
            }
            if (prima > 9999999.99) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Prima anual demasiado alta',
                    error: 'La prima máxima permitida es 9,999,999.99'
                });
            }
        }

        // Validar deducible
        if (deducible !== undefined) {
            const deducibleNum = parseFloat(deducible);
            if (isNaN(deducibleNum) || deducibleNum < 0) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Deducible inválido',
                    error: 'El deducible debe ser un número no negativo'
                });
            }
            if (deducibleNum > 999999.99) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Deducible demasiado alto',
                    error: 'El deducible máximo permitido es 999,999.99'
                });
            }
        }

        // Validar observaciones si se proporcionan
        if (req.body.observaciones && req.body.observaciones.length > 1000) {
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Las observaciones son demasiado largas',
                error: 'Máximo 1000 caracteres permitidos'
            });
        }

        next();

    } catch (error) {
        logger.error(`Error en validación de póliza: ${error.message}`);
        
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                logger.error(`Error al limpiar archivo: ${unlinkError.message}`);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error interno en validación',
            error: error.message
        });
    }
};

/**
 * Middleware para validar archivos subidos
 */
const validarArchivo = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'image/webp'
    ];

    // Validar tamaño
    if (req.file.size > maxSize) {
        fs.unlink(req.file.path).catch(err => 
            logger.error(`Error al eliminar archivo: ${err.message}`)
        );
        return res.status(400).json({
            success: false,
            message: 'Archivo demasiado grande',
            error: 'El archivo no puede exceder 10MB'
        });
    }

    // Validar tipo
    if (!allowedTypes.includes(req.file.mimetype)) {
        fs.unlink(req.file.path).catch(err => 
            logger.error(`Error al eliminar archivo: ${err.message}`)
        );
        return res.status(400).json({
            success: false,
            message: 'Tipo de archivo no permitido',
            error: 'Solo se permiten archivos JPEG, PNG, GIF, WebP y PDF'
        });
    }

    next();
};

module.exports = {
    validateVehiculo,        // ✅ Agrega esta línea
    validateRegister,
    validarDocumento,
    validarPoliza,
    validarArchivo,
    TIPOS_DOCUMENTOS_PERMITIDOS,
    TIPOS_COBERTURA_PERMITIDOS
};