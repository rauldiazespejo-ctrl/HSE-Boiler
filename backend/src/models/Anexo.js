const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const DocumentoHse = require('./DocumentoHse');
const Usuario = require('./Usuario');

const Anexo = sequelize.define('Anexo', {
  id_anexo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  documento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: DocumentoHse,
      key: 'id_documento'
    }
  },
  tipo_anexo: {
    type: DataTypes.STRING(50) // 'FOTO', 'PDF', 'CERTIFICADO', 'PLANO'
  },
  nombre_original: {
    type: DataTypes.STRING(255)
  },
  url_s3: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  tamaño_bytes: {
    type: DataTypes.INTEGER
  },
  mime_type: {
    type: DataTypes.STRING(50)
  },
  fecha_subida: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  subido_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  descripcion: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'anexos',
  timestamps: false
});

// Relationships
DocumentoHse.hasMany(Anexo, { foreignKey: 'documento_id', as: 'anexos' });
Anexo.belongsTo(DocumentoHse, { foreignKey: 'documento_id', as: 'documento' });

Usuario.hasMany(Anexo, { foreignKey: 'subido_por' });
Anexo.belongsTo(Usuario, { foreignKey: 'subido_por', as: 'usuario' });

module.exports = Anexo;
