const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');

const DocumentoHse = sequelize.define('DocumentoHse', {
  id_documento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_documento: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.ENUM('HOT_WORK', 'AST', 'LOTO', 'INSPECCION', 'ALTURA', 'PUENTE_GRUA'),
    allowNull: false
  },
  sector: {
    type: DataTypes.STRING(100)
  },
  empresa_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  contenido_json: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  riesgos_json: {
    type: DataTypes.JSONB
  },
  estado: {
    type: DataTypes.ENUM(
      'BORRADOR',
      'PENDIENTE',
      'PENDIENTE_LIDER',
      'PENDIENTE_JEFE',
      'APROBADO',
      'RECHAZADO',
      'ARCHIVADO'
    ),
    defaultValue: 'PENDIENTE_LIDER',
    allowNull: false
  },
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  aprobado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  fecha_aprobacion: {
    type: DataTypes.DATE
  },
  motivo_rechazo: {
    type: DataTypes.TEXT
  },
  comentarios_aprobador: {
    type: DataTypes.TEXT
  },
  firma_digital_creador: {
    type: DataTypes.STRING(500)
  },
  firma_digital_aprobador: {
    type: DataTypes.STRING(500)
  },
  valido_desde: {
    type: DataTypes.DATE
  },
  valido_hasta: {
    type: DataTypes.DATE
  },
  ip_origen_creacion: {
    type: DataTypes.STRING(45)
  },
  ip_origen_aprobacion: {
    type: DataTypes.STRING(45)
  },
  dispositivo_creacion: {
    type: DataTypes.STRING(255)
  },
  dispositivo_aprobacion: {
    type: DataTypes.STRING(255)
  },
  ubicacion_gps_creacion: {
    type: DataTypes.STRING(100)
  },
  ubicacion_gps_aprobacion: {
    type: DataTypes.STRING(100)
  },
  titulo_busqueda: {
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'documentos_hse',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_modificacion'
});

// Relationships
Usuario.hasMany(DocumentoHse, { foreignKey: 'creado_por', as: 'documentos_creados' });
Usuario.hasMany(DocumentoHse, { foreignKey: 'aprobado_por', as: 'documentos_aprobados' });
DocumentoHse.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'creador' });
DocumentoHse.belongsTo(Usuario, { foreignKey: 'aprobado_por', as: 'aprobador' });

module.exports = DocumentoHse;
