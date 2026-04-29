const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Faltan credenciales' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ success: false, message: 'Usuario inactivo' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Register (Development Only)
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    // Validate if exists
    const existing = await Usuario.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await Usuario.create({
      email,
      password_hash,
      nombre,
      rol: rol || 'trabajador',
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: newUser.id_usuario,
        email: newUser.email,
        rol: newUser.rol
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
