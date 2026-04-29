const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const DocumentoHse = require('./DocumentoHse');
const Anexo = require('./Anexo');
const AuditLog = require('./AuditLog');

// Ensure relationships are initialized
const models = {
  Usuario,
  DocumentoHse,
  Anexo,
  AuditLog
};

module.exports = {
  sequelize,
  ...models
};
