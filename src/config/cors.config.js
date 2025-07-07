 // src/config/cors.config.js
const cors = require('cors');


const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite peticiones sin origen (como Postman) o desde los orígenes permitidos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permite cookies/autenticación si lo necesitas
};

module.exports = cors(corsOptions);

