// src/utils/tarifas.js
const moment = require('moment');

function calcularTarifa(diasRenta, tipoVehiculo, temporada) {
    // Lógica para calcular tarifa según temporada y tipo de vehículo
    const tarifaBase = getTarifaPorTipoVehiculo(tipoVehiculo);
    const factorTemporada = getFactorTemporada(temporada);
    return diasRenta * tarifaBase * factorTemporada;
}

function getTarifaPorTipoVehiculo(tipoVehiculo) {
    // Ejemplo: precios por tipo de vehículo
    const tarifas = {
        sedan: 500,
        SUV: 700,
        camioneta: 900
    };
    return tarifas[tipoVehiculo] || 0;
}

function getFactorTemporada(temporada) {
    // Ejemplo: factores por temporada
    const factores = {
        alta: 1.2,
        baja: 0.8
    };
    return factores[temporada] || 1;
}

module.exports = {
    calcularTarifa
};