// src/models/Usuario.model.js
module.exports = {
    findByUsername: async (username) => {
        // Implementación real iría aquí
        return {
            id_usuario: 1,
            nombre_usuario: 'admin',
            password: '$2a$10$ejemploDeHash', // contraseña: "admin123"
            nombre_completo: 'Administrador',
            rol: 'admin'
        };
    }
};