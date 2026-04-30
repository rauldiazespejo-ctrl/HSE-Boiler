const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('jefe', 'lider', 'gerente', 'auditor'),
    allowNull: false
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  two_fa_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_fa_secret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sectores_autorizados: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  certificaciones_json: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

module.exports = Usuario;
