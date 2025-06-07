// src/app.js
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Asegúrate de agregar estas líneas en tu app.js principal
const vehiculoRoutes = require('./routes/vehiculo.routes');
app.use('/api/vehiculos', vehiculoRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.send('🚀 Servidor funcionando correctamente');
});

// Ruta para probar la conexión básica con la DB
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            console.error('❌ Error en la consulta:', err.message);
            return res.status(500).send('Error en la base de datos');
        }
        res.send(`✅ Resultado de prueba: ${results[0].result}`);
    });
});

// Ruta real: obtener hasta 5 usuarios
app.get('/usuarios', (req, res) => {
    const query = 'SELECT id_usuario, nombre_usuario, nombre_completo, rol, activo FROM usuarios LIMIT 5';

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err.message);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results);
    });
});


module.exports = app;
