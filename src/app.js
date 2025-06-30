const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas existentes
const vehiculoRoutes = require('./routes/vehiculo.routes');
app.use('/api/vehiculos', vehiculoRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);

// NUEVO: Rutas de usuarios con controlador
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);

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

module.exports = app;
