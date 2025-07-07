// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');


router.post('/login', authController.login);


router.post('/logout', (req, res) => {
    // El frontend debe borrar el token, aquí solo se responde ok
    res.json({ success: true, message: 'Logout exitoso' });
});

module.exports = router;