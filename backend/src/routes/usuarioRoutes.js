const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { Op } = require('sequelize');
const { Usuario } = require('../models');

router.get('/trabajadores', authMiddleware, async (req, res) => {
  try {
    const trabajadores = await Usuario.findAll({
      where: { rol: 'lider', activo: true },
      attributes: ['id_usuario', 'nombre', 'certificaciones_json'],
      order: [['nombre', 'ASC']],
    });
    res.json({ success: true, data: trabajadores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener trabajadores' });
  }
});

module.exports = router;
