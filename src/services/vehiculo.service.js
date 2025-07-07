// src/services/vehiculo.service.js
const Vehiculo = require('../models/Vehiculo.model');
const logger = require('../utils/logger');

class VehiculoService {
    // Método para obtener vehículos con filtros avanzados
    async getVehiculosWithFilters(filters) {
        try {
            // Implementar lógica de negocio adicional aquí si es necesario
            return await Vehiculo.getAll({ filters });
        } catch (error) {
            logger.error(`Error en VehiculoService.getVehiculosWithFilters: ${error.message}`);
            throw error;
        }
    }

    // Método para obtener información detallada de un vehículo
    async getVehiculoDetail(id) {
        try {
            const vehiculo = await Vehiculo.getById(id);

            if (!vehiculo) {
                throw new Error('Vehículo no encontrado');
            }

            // Aquí podríamos agregar lógica adicional de negocio
            // como verificar permisos, agregar información adicional, etc.

            return vehiculo;
        } catch (error) {
            logger.error(`Error en VehiculoService.getVehiculoDetail: ${error.message}`);
            throw error;
        }
    }

    // Método para crear un vehículo con validaciones adicionales
    async createVehiculo(vehiculoData) {
        try {
            // Validaciones de negocio adicionales
            if (vehiculoData.num_pasajeros && vehiculoData.num_pasajeros < 1) {
                throw new Error('El número de pasajeros debe ser al menos 1');
            }

            // Crear el vehículo
            return await Vehiculo.create(vehiculoData);
        } catch (error) {
            logger.error(`Error en VehiculoService.createVehiculo: ${error.message}`);
            throw error;
        }
    }

    // Método para generar reporte de flota
    async generateFlotaReport() {
        try {
            const [flota, stats] = await Promise.all([
                Vehiculo.getFlota(),
                Vehiculo.getStats()
            ]);

            return {
                flota,
                stats
            };
        } catch (error) {
            logger.error(`Error en VehiculoService.generateFlotaReport: ${error.message}`);
            throw error;
        }
    }

    // Método para obtener vehículos con pólizas próximas a vencer
    async getVehiculosConPolizasProximas(dias = 30) {
        try {
            const vehiculos = await Vehiculo.getWithPolizas();

            return vehiculos.filter(v => {
                if (!v.fecha_vencimiento) return false;
                const diasRestantes = v.dias_restantes;
                return diasRestantes > 0 && diasRestantes <= dias;
            });
        } catch (error) {
            logger.error(`Error en VehiculoService.getVehiculosConPolizasProximas: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new VehiculoService();