//src/controllers/contrato.controller.js
const Contrato = require("../models/Contrato.model")
const { validationResult } = require("express-validator")
const logger = require("../utils/logger")
const PDFDocument = require("pdfkit")
const fs = require("fs")

exports.getAllContratos = async (req, res) => {
    try {
        const { page, limit, ...filters } = req.query
        const parsedPage = Number.parseInt(page) || 1
        const parsedLimit = Number.parseInt(limit) || 10

        const result = await Contrato.getAll({ page: parsedPage, limit: parsedLimit, filters })

        res.status(200).json({
            success: true,
            message: "Lista de contratos obtenida correctamente",
            data: { contratos: result.data },
            pagination: {
                total: result.total,
                page: parsedPage,
                limit: parsedLimit,
            },
        })
    } catch (error) {
        logger.error(`Error al obtener contratos: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}

exports.createContrato = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
            })
        }

        const contratoData = {
            num_contrato: req.body.num_contrato,
            dias_renta: req.body.dias_renta,
            lugar_expedicion: req.body.lugar_expedicion,
            fecha_salida: req.body.fecha_salida,
            fecha_entrada: req.body.fecha_entrada,
            id_cliente: Number.parseInt(req.body.id_cliente),
            id_vehiculo: Number.parseInt(req.body.id_vehiculo),
            id_usuario: Number.parseInt(req.user?.id_usuario || 1),
            id_agencia: req.body.id_agencia ? Number.parseInt(req.body.id_agencia) : null,
            subtotal: Number.parseFloat(req.body.subtotal),
            iva: Number.parseFloat(req.body.iva),
            total: Number.parseFloat(req.body.total),
            id_tipo_cambio: req.body.id_tipo_cambio ? Number.parseInt(req.body.id_tipo_cambio) : 1,
            km_salida: req.body.km_salida ? Number.parseInt(req.body.km_salida) : 0,
            gasolina_salida: req.body.gasolina_salida ? Number.parseFloat(req.body.gasolina_salida) : 8.0,
        }

        const contratoId = await Contrato.create(contratoData)
        const contrato = await Contrato.getById(contratoId)

        res.status(201).json({
            success: true,
            message: "Contrato creado correctamente",
            data: { contrato },
        })
    } catch (error) {
        logger.error(`Error al crear contrato: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}

exports.getContratoById = async (req, res) => {
    try {
        const contrato = await Contrato.getById(Number.parseInt(req.params.id))
        if (!contrato) {
            return res.status(404).json({
                success: false,
                message: "Contrato no encontrado",
            })
        }
        res.status(200).json({
            success: true,
            data: { contrato },
        })
    } catch (error) {
        logger.error(`Error al obtener contrato: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}

// Esto es del controlador
exports.updateContrato = async (req, res) => {
    try {
        // Validar errores de validación si existen
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Errores de validación",
                errors: errors.array(),
            })
        }

        const contratoId = Number.parseInt(req.params.id)
        
        // Validar que el ID sea un número válido
        if (isNaN(contratoId) || contratoId <= 0) {
            return res.status(400).json({
                success: false,
                message: "ID de contrato inválido",
            })
        }

        // Verificar que el contrato existe
        const contrato = await Contrato.getById(contratoId)
        if (!contrato) {
            return res.status(404).json({
                success: false,
                message: "Contrato no encontrado",
            })
        }

        // Validar que se enviaron datos para actualizar
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionaron datos para actualizar",
            })
        }

        // Procesar y limpiar los datos del body
        
        const updateData = {}
        
        // Campos de texto
        if (req.body.num_contrato !== undefined && req.body.num_contrato !== null) {
            updateData.num_contrato = req.body.num_contrato
        }
        if (req.body.lugar_expedicion !== undefined && req.body.lugar_expedicion !== null) {
            updateData.lugar_expedicion = req.body.lugar_expedicion
        }
        if (req.body.fecha_salida !== undefined && req.body.fecha_salida !== null) {
            updateData.fecha_salida = req.body.fecha_salida
        }
        if (req.body.fecha_entrada !== undefined && req.body.fecha_entrada !== null) {
            updateData.fecha_entrada = req.body.fecha_entrada
        }
        if (req.body.estado !== undefined && req.body.estado !== null) {
            updateData.estado = req.body.estado
        }
        
        // Campos numéricos enteros
        if (req.body.dias_renta !== undefined && req.body.dias_renta !== null) {
            const diasRenta = Number.parseInt(req.body.dias_renta)
            if (!isNaN(diasRenta) && diasRenta > 0) {
                updateData.dias_renta = diasRenta
            }
        }
        if (req.body.id_cliente !== undefined && req.body.id_cliente !== null) {
            const idCliente = Number.parseInt(req.body.id_cliente)
            if (!isNaN(idCliente) && idCliente > 0) {
                updateData.id_cliente = idCliente
            }
        }
        if (req.body.id_vehiculo !== undefined && req.body.id_vehiculo !== null) {
            const idVehiculo = Number.parseInt(req.body.id_vehiculo)
            if (!isNaN(idVehiculo) && idVehiculo > 0) {
                updateData.id_vehiculo = idVehiculo
            }
        }
        if (req.body.id_usuario !== undefined && req.body.id_usuario !== null) {
            const idUsuario = Number.parseInt(req.body.id_usuario)
            if (!isNaN(idUsuario) && idUsuario > 0) {
                updateData.id_usuario = idUsuario
            }
        }
        if (req.body.id_agencia !== undefined && req.body.id_agencia !== null) {
            const idAgencia = Number.parseInt(req.body.id_agencia)
            if (!isNaN(idAgencia) && idAgencia > 0) {
                updateData.id_agencia = idAgencia
            }
        }
        if (req.body.id_tipo_cambio !== undefined && req.body.id_tipo_cambio !== null) {
            const idTipoCambio = Number.parseInt(req.body.id_tipo_cambio)
            if (!isNaN(idTipoCambio) && idTipoCambio > 0) {
                updateData.id_tipo_cambio = idTipoCambio
            }
        }
        if (req.body.km_salida !== undefined && req.body.km_salida !== null) {
            const kmSalida = Number.parseInt(req.body.km_salida)
            if (!isNaN(kmSalida) && kmSalida >= 0) {
                updateData.km_salida = kmSalida
            }
        }
        if (req.body.km_entrada !== undefined && req.body.km_entrada !== null) {
            const kmEntrada = Number.parseInt(req.body.km_entrada)
            if (!isNaN(kmEntrada) && kmEntrada >= 0) {
                updateData.km_entrada = kmEntrada
            }
        }
        
        // Campos decimales
        if (req.body.subtotal !== undefined && req.body.subtotal !== null) {
            const subtotal = Number.parseFloat(req.body.subtotal)
            if (!isNaN(subtotal) && subtotal >= 0) {
                updateData.subtotal = subtotal
            }
        }
        if (req.body.iva !== undefined && req.body.iva !== null) {
            const iva = Number.parseFloat(req.body.iva)
            if (!isNaN(iva) && iva >= 0) {
                updateData.iva = iva
            }
        }
        if (req.body.total !== undefined && req.body.total !== null) {
            const total = Number.parseFloat(req.body.total)
            if (!isNaN(total) && total >= 0) {
                updateData.total = total
            }
        }
        if (req.body.gasolina_salida !== undefined && req.body.gasolina_salida !== null) {
            const gasolinaSalida = Number.parseFloat(req.body.gasolina_salida)
            if (!isNaN(gasolinaSalida) && gasolinaSalida >= 0) {
                updateData.gasolina_salida = gasolinaSalida
            }
        }
        if (req.body.gasolina_entrada !== undefined && req.body.gasolina_entrada !== null) {
            const gasolinaEntrada = Number.parseFloat(req.body.gasolina_entrada)
            if (!isNaN(gasolinaEntrada) && gasolinaEntrada >= 0) {
                updateData.gasolina_entrada = gasolinaEntrada
            }
        }

        // Verificar que hay al menos un campo válido para actualizar
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No se encontraron campos válidos para actualizar",
            })
        }

        // Intentar actualizar el contrato
        const result = await Contrato.update(contratoId, updateData)

        // Obtener el contrato actualizado
        const contratoActualizado = await Contrato.getById(contratoId)

        res.status(200).json({
            success: true,
            message: "Contrato actualizado exitosamente",
            data: { 
                contrato: contratoActualizado,
                ...result 
            },
        })
        
    } catch (error) {
        logger.error(`Error al actualizar contrato: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error al actualizar el contrato",
            error: error.message,
        })
    }
}

exports.deleteContrato = async (req, res) => {
    try {
        const contratoEliminado = await Contrato.delete(Number.parseInt(req.params.id))
        if (!contratoEliminado) {
            return res.status(404).json({
                success: false,
                message: "Contrato no encontrado",
            })
        }
        res.status(200).json({
            success: true,
            message: "Contrato eliminado correctamente",
        })
    } catch (error) {
        logger.error(`Error al eliminar contrato: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}

exports.updateContratoStatus = async (req, res) => {
    try {
        const { estado } = req.body
        const contratoActualizado = await Contrato.updateStatus(Number.parseInt(req.params.id), estado)
        if (!contratoActualizado) {
            return res.status(404).json({
                success: false,
                message: "Contrato no encontrado",
            })
        }
        res.status(200).json({
            success: true,
            message: "Estado del contrato actualizado correctamente",
            data: { estado },
        })
    } catch (error) {
        logger.error(`Error al actualizar estado del contrato: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}

exports.downloadContratoPDF = async (req, res) => {
    try {
        const contrato = await Contrato.getById(Number.parseInt(req.params.id))
        if (!contrato) {
            return res.status(404).json({
                success: false,
                message: "Contrato no encontrado",
            })
        }

        const doc = new PDFDocument()
        let filename = `Contrato_${contrato.num_contrato}.pdf`
        filename = encodeURIComponent(filename)

        res.setHeader("Content-disposition", 'attachment; filename="' + filename + '"')
        res.setHeader("Content-type", "application/pdf")

        doc.text(`Contrato: ${contrato.num_contrato}`)
        doc.text(`Cliente: ${contrato.id_cliente}`)
        doc.text(`Vehículo: ${contrato.id_vehiculo}`)
        doc.text(`Fecha expedición: ${contrato.fecha_expedicion}`)
        // ...agrega más campos según tu modelo...

        doc.pipe(res)
        doc.end()
    } catch (error) {
        logger.error(`Error al generar PDF del contrato: ${error.message}`)
        res.status(500).json({
            success: false,
            message: "Error al generar PDF",
            error: error.message,
        })
    }
}

exports.getVistaCompleta = async (req, res) => {
    try {
        const filtros = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            estado: req.query.estado || null,
            clienteNombre: req.query.cliente || null,
            orderBy: req.query.orderBy || "fecha_salida",
            orderDir: req.query.orderDir || "DESC",
        }
        const resultado = await Contrato.obtenerVistaCompleta(filtros)
        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Error en getVistaCompleta:", error)
        return res.status(500).json({
            success: false,
            message: "Error al obtener vista completa",
            error: error.message,
        })
    }
}

exports.buscarPorCliente = async (req, res) => {
    try {
        const { cliente } = req.params
        if (!cliente || cliente.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "El nombre del cliente debe tener al menos 2 caracteres",
            })
        }
        const filtros = {
            clienteNombre: cliente,
            page: req.query.page || 1,
            limit: req.query.limit || 10,
        }
        const resultado = await Contrato.obtenerVistaCompleta(filtros)
        return res.status(200).json(resultado)
    } catch (error) {
        console.error("Error en buscarPorCliente:", error)
        return res.status(500).json({
            success: false,
            message: "Error al buscar contratos",
            error: error.message,
        })
    }
}