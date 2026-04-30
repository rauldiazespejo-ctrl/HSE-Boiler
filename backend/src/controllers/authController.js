const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const ADMIN_ROLES = ['gerente', 'jefe'];

exports.listaUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      where: { activo: true, rol: ['jefe', 'gerente'] },
      attributes: ['id_usuario', 'nombre', 'rol', 'certificaciones_json'],
      order: [['rol', 'ASC'], ['nombre', 'ASC']],
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, id_usuario, password } = req.body;

    if ((!email && !id_usuario) || !password) {
      return res.status(400).json({ success: false, message: 'Faltan credenciales' });
    }

    const where = id_usuario ? { id_usuario } : { email };
    const usuario = await Usuario.findOne({ where });
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
      {
        id: usuario.id_usuario,
        rol: usuario.rol,
        nombre: usuario.nombre,
        empresa_id: usuario.empresa_id
      },
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

exports.me = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      attributes: ['id_usuario', 'nombre', 'email', 'rol', 'activo', 'empresa_id']
    });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    return res.json({ success: true, usuario });
  } catch (error) {
    console.error('Error in me:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

exports.requireRegistrationPrivileges = (req, res, next) => {
  const allowPublicRegister = process.env.ALLOW_PUBLIC_REGISTER === 'true';
  if (allowPublicRegister) {
    return next();
  }

  if (!req.user || !ADMIN_ROLES.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'Registro restringido. Solo personal autorizado puede crear usuarios.'
    });
  }

  return next();
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
      activo: true,
      empresa_id: req.user?.empresa_id || null
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
