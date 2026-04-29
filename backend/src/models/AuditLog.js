const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');

const AuditLog = sequelize.define('AuditLog', {
  id_log: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tabla_afectada: {
    type: DataTypes.STRING(100)
  },
  id_registro: {
    type: DataTypes.INTEGER
  },
  tipo_cambio: {
    type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE')
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  usuario_rol: {
    type: DataTypes.STRING(50)
  },
  cambios_json: {
    type: DataTypes.JSONB
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  dispositivo: {
    type: DataTypes.STRING(255)
  },
  ubicacion_gps: {
    type: DataTypes.STRING(100)
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_log',
  timestamps: false
});

// Relationships
Usuario.hasMany(AuditLog, { foreignKey: 'usuario_id' });
AuditLog.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = AuditLog;
