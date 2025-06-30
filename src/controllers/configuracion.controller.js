 // src/controllers/usuario.controller.js
const Usuario = require('../models/Usuario.model');

exports.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.getAll();
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);
        res.status(201).json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEstado = async (req, res) => {
    try {
        const { activo } = req.body;
        await Usuario.updateEstado(req.params.id, activo);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        await Usuario.delete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

